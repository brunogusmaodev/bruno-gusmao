package dev.brunogusmao.api.push;

import dev.brunogusmao.api.auth.AppSecurityProperties;
import dev.brunogusmao.api.auth.JwtService;
import dev.brunogusmao.api.auth.User;
import dev.brunogusmao.api.auth.UserRepository;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Sem chaves VAPID configuradas: assinaturas funcionam, public-key responde 503. */
@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
class PushControllerIT {

    @Container
    @ServiceConnection
    static PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:16-alpine");

    @DynamicPropertySource
    static void appProperties(DynamicPropertyRegistry registry) {
        registry.add("app.security.jwt-secret", () -> "01234567890123456789012345678901");
        registry.add("app.security.jwt-cookie-name", () -> "access_token");
        registry.add("spring.security.oauth2.client.registration.google.client-id", () -> "test-client-id");
        registry.add("spring.security.oauth2.client.registration.google.client-secret", () -> "test-client-secret");
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PushSubscriptionRepository subscriptionRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private AppSecurityProperties securityProperties;

    private User userA;
    private User userB;
    private Cookie cookieA;
    private Cookie cookieB;

    @BeforeEach
    void setUp() {
        String suffix = UUID.randomUUID().toString();
        userA = userRepository.save(new User("User A", "pushA-" + suffix + "@example.com", null));
        userB = userRepository.save(new User("User B", "pushB-" + suffix + "@example.com", null));
        cookieA = new Cookie(securityProperties.getJwtCookieName(), jwtService.generateToken(userA));
        cookieB = new Cookie(securityProperties.getJwtCookieName(), jwtService.generateToken(userB));
    }

    @Test
    void publicKeyWithoutVapidConfigReturns503() throws Exception {
        mockMvc.perform(get("/api/push/public-key").cookie(cookieA))
                .andExpect(status().isServiceUnavailable());
    }

    @Test
    void subscribeRequiresAuth() throws Exception {
        mockMvc.perform(post("/api/push/subscriptions")
                        .contentType("application/json")
                        .content(body("https://push.example/" + UUID.randomUUID())))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void subscribeUpsertsByEndpointAndUnsubscribeIsScopedToOwner() throws Exception {
        String endpoint = "https://push.example/" + UUID.randomUUID();

        mockMvc.perform(post("/api/push/subscriptions").cookie(cookieA)
                        .contentType("application/json")
                        .content(body(endpoint)))
                .andExpect(status().isCreated());
        assertThat(subscriptionRepository.findByUserId(userA.getId())).hasSize(1);

        // Mesmo navegador, outro usuário logado: a assinatura passa a ser de B.
        mockMvc.perform(post("/api/push/subscriptions").cookie(cookieB)
                        .contentType("application/json")
                        .content(body(endpoint)))
                .andExpect(status().isCreated());
        assertThat(subscriptionRepository.findByUserId(userA.getId())).isEmpty();
        assertThat(subscriptionRepository.findByUserId(userB.getId())).hasSize(1);

        // A não consegue remover a assinatura de B.
        mockMvc.perform(delete("/api/push/subscriptions").cookie(cookieA)
                        .contentType("application/json")
                        .content("{\"endpoint\":\"" + endpoint + "\"}"))
                .andExpect(status().isNoContent());
        assertThat(subscriptionRepository.findByEndpoint(endpoint)).isPresent();

        mockMvc.perform(delete("/api/push/subscriptions").cookie(cookieB)
                        .contentType("application/json")
                        .content("{\"endpoint\":\"" + endpoint + "\"}"))
                .andExpect(status().isNoContent());
        assertThat(subscriptionRepository.findByEndpoint(endpoint)).isEmpty();
    }

    @Test
    void subscribeWithoutKeysReturns400() throws Exception {
        mockMvc.perform(post("/api/push/subscriptions").cookie(cookieA)
                        .contentType("application/json")
                        .content("{\"endpoint\":\"https://push.example/x\"}"))
                .andExpect(status().isBadRequest());
    }

    private static String body(String endpoint) {
        return """
                {"endpoint":"%s","keys":{"p256dh":"BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8QcYP7DkM","auth":"tBHItJI5svbpez7KI4CCXg"}}
                """.formatted(endpoint);
    }
}

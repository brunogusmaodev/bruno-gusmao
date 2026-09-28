package dev.brunogusmao.api.push;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.brunogusmao.api.auth.User;
import dev.brunogusmao.api.auth.UserRepository;
import dev.brunogusmao.api.common.exception.NotFoundException;
import dev.brunogusmao.api.push.dto.PushSubscribeRequest;
import jakarta.annotation.PostConstruct;
import nl.martijndwars.webpush.Encoding;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import nl.martijndwars.webpush.Urgency;
import org.apache.http.HttpResponse;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.GeneralSecurityException;
import java.security.Security;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

/**
 * Guarda as assinaturas Web Push e envia notificações via VAPID. Sem chaves configuradas,
 * {@link #isEnabled()} é false e os envios viram no-op.
 */
@Service
@Transactional
@EnableConfigurationProperties(PushProperties.class)
public class PushNotificationService {

    private static final Logger log = LoggerFactory.getLogger(PushNotificationService.class);

    private final PushSubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;
    private final PushProperties properties;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private PushService pushService;

    public PushNotificationService(PushSubscriptionRepository subscriptionRepository,
                                   UserRepository userRepository, PushProperties properties) {
        this.subscriptionRepository = subscriptionRepository;
        this.userRepository = userRepository;
        this.properties = properties;
    }

    @PostConstruct
    void init() {
        if (!properties.isConfigured()) {
            log.warn("VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY ausentes — notificações push desabilitadas.");
            return;
        }
        if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
            Security.addProvider(new BouncyCastleProvider());
        }
        try {
            pushService = new PushService(properties.getVapidPublicKey(), properties.getVapidPrivateKey(),
                    properties.getSubject());
        } catch (GeneralSecurityException e) {
            log.error("Chaves VAPID inválidas — notificações push desabilitadas.", e);
        }
    }

    public boolean isEnabled() {
        return pushService != null;
    }

    public String getPublicKey() {
        return properties.getVapidPublicKey();
    }

    public void subscribe(PushSubscribeRequest request, UUID userId, String userAgent) {
        User user = userRepository.findById(userId).orElseThrow(NotFoundException::new);
        // Upsert por endpoint: o mesmo navegador pode trocar de usuário logado.
        PushSubscription subscription = subscriptionRepository.findByEndpoint(request.endpoint())
                .orElseGet(PushSubscription::new);
        subscription.setEndpoint(request.endpoint());
        subscription.setP256dh(request.keys().p256dh());
        subscription.setAuth(request.keys().auth());
        subscription.setUser(user);
        subscription.setUserAgent(userAgent != null && userAgent.length() > 512 ? userAgent.substring(0, 512) : userAgent);
        subscriptionRepository.save(subscription);
    }

    public void unsubscribe(String endpoint, UUID userId) {
        subscriptionRepository.deleteByEndpointAndUserId(endpoint, userId);
    }

    public void sendToUsers(Collection<UUID> userIds, PushPayload payload) {
        send(subscriptionRepository.findByUserIdIn(userIds), payload);
    }

    public void sendToAll(PushPayload payload) {
        send(subscriptionRepository.findAll(), payload);
    }

    private void send(List<PushSubscription> subscriptions, PushPayload payload) {
        if (!isEnabled() || subscriptions.isEmpty()) {
            return;
        }
        String json;
        try {
            json = objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException(e);
        }
        for (PushSubscription subscription : subscriptions) {
            try {
                Notification notification = new Notification(subscription.getEndpoint(), subscription.getP256dh(),
                        subscription.getAuth(), json, Urgency.HIGH);
                HttpResponse response = pushService.send(notification, Encoding.AES128GCM);
                int status = response.getStatusLine().getStatusCode();
                if (status == 404 || status == 410) {
                    // Assinatura expirada/revogada pelo navegador.
                    subscriptionRepository.deleteByEndpoint(subscription.getEndpoint());
                } else if (status >= 400) {
                    log.warn("Push recusado ({}) para {}", status, subscription.getEndpoint());
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return;
            } catch (Exception e) {
                log.warn("Falha ao enviar push para {}", subscription.getEndpoint(), e);
            }
        }
    }
}

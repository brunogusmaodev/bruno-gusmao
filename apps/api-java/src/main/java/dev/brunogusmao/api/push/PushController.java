package dev.brunogusmao.api.push;

import dev.brunogusmao.api.auth.CurrentUser;
import dev.brunogusmao.api.auth.CurrentUserPrincipal;
import dev.brunogusmao.api.push.dto.PushSubscribeRequest;
import dev.brunogusmao.api.push.dto.PushUnsubscribeRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/** Rotas autenticadas pelo catch-all {@code /api/**} de {@code SecurityConfig}. */
@RestController
@RequestMapping("/api/push")
@Tag(name = "push")
public class PushController {

    private final PushNotificationService pushNotificationService;

    public PushController(PushNotificationService pushNotificationService) {
        this.pushNotificationService = pushNotificationService;
    }

    @GetMapping("/public-key")
    @Operation(summary = "Chave pública VAPID", description = "503 se o push não estiver configurado no servidor.")
    public ResponseEntity<Map<String, String>> publicKey() {
        if (!pushNotificationService.isEnabled()) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        }
        return ResponseEntity.ok(Map.of("publicKey", pushNotificationService.getPublicKey()));
    }

    @PostMapping("/subscriptions")
    @Operation(summary = "Registrar assinatura push", description = "Upsert por endpoint, vinculado ao usuário autenticado.")
    public ResponseEntity<Void> subscribe(@Valid @RequestBody PushSubscribeRequest request,
                                          @RequestHeader(value = HttpHeaders.USER_AGENT, required = false) String userAgent,
                                          @CurrentUser CurrentUserPrincipal user) {
        pushNotificationService.subscribe(request, user.id(), userAgent);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/subscriptions")
    @Operation(summary = "Remover assinatura push")
    public ResponseEntity<Void> unsubscribe(@Valid @RequestBody PushUnsubscribeRequest request,
                                            @CurrentUser CurrentUserPrincipal user) {
        pushNotificationService.unsubscribe(request.endpoint(), user.id());
        return ResponseEntity.noContent().build();
    }
}

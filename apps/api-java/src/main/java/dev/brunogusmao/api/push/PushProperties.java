package dev.brunogusmao.api.push;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Bind de {@code app.push.*} — chaves VAPID do Web Push. Gerar o par com
 * {@code npx web-push generate-vapid-keys}. Chaves vazias desabilitam o envio (o resto da
 * API sobe normalmente).
 */
@ConfigurationProperties(prefix = "app.push")
public class PushProperties {

    private String vapidPublicKey;
    private String vapidPrivateKey;
    private String subject = "mailto:admin@brunogusmao.dev";

    public boolean isConfigured() {
        return vapidPublicKey != null && !vapidPublicKey.isBlank()
                && vapidPrivateKey != null && !vapidPrivateKey.isBlank();
    }

    public String getVapidPublicKey() {
        return vapidPublicKey;
    }

    public void setVapidPublicKey(String vapidPublicKey) {
        this.vapidPublicKey = vapidPublicKey;
    }

    public String getVapidPrivateKey() {
        return vapidPrivateKey;
    }

    public void setVapidPrivateKey(String vapidPrivateKey) {
        this.vapidPrivateKey = vapidPrivateKey;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }
}

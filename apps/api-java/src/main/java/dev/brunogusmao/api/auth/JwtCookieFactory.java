package dev.brunogusmao.api.auth;

import org.springframework.http.ResponseCookie;

/**
 * Monta o cookie do JWT com os mesmos atributos em todo lugar que precisa setá-lo/limpá-lo
 * (login e logout) — evita divergência de {@code path}/{@code sameSite} entre as duas rotas,
 * o que faria o logout falhar em limpar o cookie no browser.
 */
final class JwtCookieFactory {

    private JwtCookieFactory() {
    }

    static ResponseCookie build(AppSecurityProperties properties, boolean secure, String value, long maxAgeSeconds) {
        return ResponseCookie.from(properties.getJwtCookieName(), value)
                .httpOnly(true)
                .secure(secure)
                // Equivalente à mitigação de CSRF do BetterAuth hoje (cookie SameSite=Lax +
                // CORS restrito à origem exata do frontend) — ver 00-arquitetura.md.
                .sameSite("Lax")
                .path("/")
                .maxAge(maxAgeSeconds)
                .build();
    }
}

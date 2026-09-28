package dev.brunogusmao.api.push.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/** Mesmo formato do {@code PushSubscription.toJSON()} do navegador. */
public record PushSubscribeRequest(
        @NotBlank
        String endpoint,

        @NotNull
        @Valid
        Keys keys
) {
    public record Keys(@NotBlank String p256dh, @NotBlank String auth) {
    }
}

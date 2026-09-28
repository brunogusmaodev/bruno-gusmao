package dev.brunogusmao.api.push.dto;

import jakarta.validation.constraints.NotBlank;

public record PushUnsubscribeRequest(@NotBlank String endpoint) {
}

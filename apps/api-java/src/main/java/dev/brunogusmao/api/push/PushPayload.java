package dev.brunogusmao.api.push;

/** JSON entregue ao service worker ({@code apps/web/src/sw.ts}, listener {@code push}). */
public record PushPayload(String title, String body, String url, String tag) {
}

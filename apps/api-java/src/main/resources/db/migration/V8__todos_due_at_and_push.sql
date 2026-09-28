-- Vencimento + lembrete dos todos (ver docs/java-migration/06-todos.md).
-- notified_at marca que o lembrete já foi disparado; volta a NULL quando due_at muda.
ALTER TABLE todos
    ADD COLUMN due_at TIMESTAMPTZ,
    ADD COLUMN notified_at TIMESTAMPTZ;

CREATE INDEX idx_todos_due_pending ON todos (due_at)
    WHERE done = false AND notified_at IS NULL;

-- Assinaturas Web Push (uma por navegador/dispositivo de cada usuário).
CREATE TABLE push_subscriptions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    user_agent VARCHAR(512),
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions (user_id);

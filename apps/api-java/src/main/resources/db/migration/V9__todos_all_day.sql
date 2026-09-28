-- Data obrigatória, hora opcional (ver docs/java-migration/06-todos.md).
-- all_day = true: o todo vale pro dia inteiro; due_at guarda o horário do lembrete
-- (09:00 no fuso do navegador de quem salvou) e a hora não é exibida.
ALTER TABLE todos ADD COLUMN all_day BOOLEAN NOT NULL DEFAULT false;

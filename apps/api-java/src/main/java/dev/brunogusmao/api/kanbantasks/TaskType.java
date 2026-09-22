package dev.brunogusmao.api.kanbantasks;

/**
 * Tipo visual de uma tarefa do kanban standalone — só metadado de exibição
 * (cor/ícone no painel), sem relação com FK para {@code badges}/{@code projects}.
 * Equivalente ao {@code TASK_TYPES} do Nest ({@code apps/api/src/db/schema/kanban-tasks.ts}).
 */
public enum TaskType {
    BLOG,
    PROJECT,
    CUSTOM
}

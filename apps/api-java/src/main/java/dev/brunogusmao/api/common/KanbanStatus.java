package dev.brunogusmao.api.common;

/**
 * Status de uma coluna do quadro Kanban. Compartilhado entre o módulo
 * {@code kanbantasks} e os futuros módulos {@code projects}/{@code posts} (que usam
 * {@code kanbanStatus} apenas para organização interna no painel — ver
 * {@code docs/java-migration/03-projects.md}). Equivalente ao {@code KANBAN_STATUSES}
 * do Nest ({@code apps/api/src/db/schema/projects.ts}).
 *
 * Vive em {@code common} (não em {@code kanbantasks}) justamente para que os outros
 * módulos possam importá-lo sem duplicação nem dependência cruzada entre pacotes de
 * feature.
 */
public enum KanbanStatus {
    BACKLOG,
    TODO,
    IN_PROGRESS,
    DONE
}

package dev.brunogusmao.api.todos;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface TodoRepository extends JpaRepository<Todo, UUID> {

    /**
     * Escopo de leitura do modelo de dois usuários: tudo que é compartilhado + o que é
     * privado do próprio usuário, ordenado por createdAt (ver 06-todos.md). Expresso como
     * @Query porque o OR entre duas condições diferentes ("shared = true" x "owner.id = :id")
     * não é limpo de derivar via method-query-derivation.
     */
    @Query("SELECT t FROM Todo t WHERE t.shared = true OR t.owner.id = :userId ORDER BY t.dueAt ASC NULLS LAST, t.createdAt")
    List<Todo> findAllForUser(@Param("userId") UUID userId);

    @Query("SELECT t FROM Todo t JOIN FETCH t.owner WHERE t.done = false AND t.notifiedAt IS NULL AND t.dueAt <= :now")
    List<Todo> findDueForNotification(@Param("now") Instant now);
}

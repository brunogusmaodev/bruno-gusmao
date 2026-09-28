package dev.brunogusmao.api.todos;

import dev.brunogusmao.api.auth.User;
import dev.brunogusmao.api.auth.UserRepository;
import dev.brunogusmao.api.push.PushNotificationService;
import dev.brunogusmao.api.push.PushPayload;
import dev.brunogusmao.api.todos.dto.TodoUpdateRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.clearInvocations;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@Testcontainers
@SpringBootTest
class TodoReminderSchedulerIT {

    @Container
    @ServiceConnection
    static PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:16-alpine");

    @DynamicPropertySource
    static void appProperties(DynamicPropertyRegistry registry) {
        registry.add("app.security.jwt-secret", () -> "01234567890123456789012345678901");
        registry.add("spring.security.oauth2.client.registration.google.client-id", () -> "test-client-id");
        registry.add("spring.security.oauth2.client.registration.google.client-secret", () -> "test-client-secret");
        // O teste chama o scheduler na mão; o agendamento automático não pode concorrer.
        registry.add("app.push.reminder-initial-delay-ms", () -> "3600000");
        registry.add("app.push.reminder-interval-ms", () -> "3600000");
    }

    @MockitoBean
    private PushNotificationService pushNotificationService;

    @Autowired
    private TodoReminderScheduler scheduler;

    @Autowired
    private TodoRepository todoRepository;

    @Autowired
    private TodoService todoService;

    @Autowired
    private UserRepository userRepository;

    private User owner;

    @BeforeEach
    void setUp() {
        todoRepository.deleteAll();
        clearInvocations(pushNotificationService);
        owner = userRepository.save(new User("Owner", "owner-" + UUID.randomUUID() + "@example.com", null));
    }

    @Test
    void privateDueTodoNotifiesOnlyOwnerOnce() {
        Todo todo = save("Privada vencida", false, false, Instant.now().minusSeconds(60));

        scheduler.sendDueReminders();

        ArgumentCaptor<PushPayload> payload = ArgumentCaptor.forClass(PushPayload.class);
        verify(pushNotificationService).sendToUsers(argThat(ids -> ids.size() == 1 && ids.contains(owner.getId())), payload.capture());
        verify(pushNotificationService, never()).sendToAll(any());
        assertThat(payload.getValue().title()).isEqualTo("Privada vencida");
        assertThat(payload.getValue().tag()).isEqualTo("todo-" + todo.getId());
        assertThat(todoRepository.findById(todo.getId()).orElseThrow().getNotifiedAt()).isNotNull();

        clearInvocations(pushNotificationService);
        scheduler.sendDueReminders();
        verify(pushNotificationService, never()).sendToUsers(any(), any());
    }

    @Test
    void sharedDueTodoNotifiesEveryone() {
        save("Compartilhada vencida", true, false, Instant.now().minusSeconds(60));

        scheduler.sendDueReminders();

        verify(pushNotificationService).sendToAll(argThat(p -> p.title().equals("Compartilhada vencida")));
        verify(pushNotificationService, never()).sendToUsers(any(), any());
    }

    @Test
    void doneFutureOrUndatedTodosAreIgnored() {
        save("Concluída", false, true, Instant.now().minusSeconds(60));
        save("Futura", false, false, Instant.now().plus(Duration.ofHours(1)));
        save("Sem data", false, false, null);

        scheduler.sendDueReminders();

        verify(pushNotificationService, never()).sendToUsers(any(), any());
        verify(pushNotificationService, never()).sendToAll(any());
    }

    @Test
    void changingDueAtResetsReminder() {
        Todo todo = save("Reagendada", false, false, Instant.now().minusSeconds(60));
        scheduler.sendDueReminders();
        assertThat(todoRepository.findById(todo.getId()).orElseThrow().getNotifiedAt()).isNotNull();

        Instant newDue = Instant.now().minusSeconds(5);
        todoService.update(todo.getId(), new TodoUpdateRequest(null, null, null, null, newDue, null), owner.getId());
        assertThat(todoRepository.findById(todo.getId()).orElseThrow().getNotifiedAt()).isNull();

        clearInvocations(pushNotificationService);
        scheduler.sendDueReminders();
        verify(pushNotificationService).sendToUsers(any(), any());
    }

    private Todo save(String title, boolean shared, boolean done, Instant dueAt) {
        Todo todo = new Todo();
        todo.setTitle(title);
        todo.setShared(shared);
        todo.setDone(done);
        todo.setDueAt(dueAt);
        todo.setOwner(owner);
        return todoRepository.save(todo);
    }
}

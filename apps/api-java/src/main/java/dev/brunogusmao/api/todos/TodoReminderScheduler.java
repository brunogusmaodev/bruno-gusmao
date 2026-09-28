package dev.brunogusmao.api.todos;

import dev.brunogusmao.api.push.PushNotificationService;
import dev.brunogusmao.api.push.PushPayload;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

/**
 * Dispara o lembrete push de cada todo quando {@code dueAt} chega. Privado → só o dono;
 * compartilhado → todos os usuários com assinatura. {@code notifiedAt} é gravado mesmo se
 * o envio falhar, pra não reenviar em loop a cada ciclo.
 */
@Component
public class TodoReminderScheduler {

    private final TodoRepository todoRepository;
    private final PushNotificationService pushNotificationService;

    public TodoReminderScheduler(TodoRepository todoRepository, PushNotificationService pushNotificationService) {
        this.todoRepository = todoRepository;
        this.pushNotificationService = pushNotificationService;
    }

    @Scheduled(fixedDelayString = "${app.push.reminder-interval-ms:30000}",
            initialDelayString = "${app.push.reminder-initial-delay-ms:10000}")
    @Transactional
    public void sendDueReminders() {
        Instant now = Instant.now();
        List<Todo> due = todoRepository.findDueForNotification(now);
        for (Todo todo : due) {
            PushPayload payload = new PushPayload(
                    todo.getTitle(),
                    todo.getDescription() != null && !todo.getDescription().isBlank()
                            ? todo.getDescription()
                            : reminderBody(todo),
                    "/ControlPanel/todos",
                    "todo-" + todo.getId());
            if (todo.isShared()) {
                pushNotificationService.sendToAll(payload);
            } else {
                pushNotificationService.sendToUsers(List.of(todo.getOwner().getId()), payload);
            }
            todo.setNotifiedAt(now);
        }
    }

    private static String reminderBody(Todo todo) {
        if (todo.isAllDay()) {
            return todo.isShared() ? "Tarefa compartilhada para hoje" : "Sua tarefa é para hoje";
        }
        return todo.isShared() ? "Tarefa compartilhada vencendo agora" : "Sua tarefa está vencendo agora";
    }
}

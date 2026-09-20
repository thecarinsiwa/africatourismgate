# PR-12 — Scénario de test (notifications staff persistées)

Branche : `feature/pr-12-notifications-persist`  
Réf. : [roadmap-post-reunion-08-2026.md](./roadmap-post-reunion-08-2026.md) (PR-12)

## Décision (cadrage)

| Élément | Décision |
| ------- | -------- |
| Modèle | 1 ligne **par destinataire** : `user_id` + `type` + `payload` JSON + `read_at` + `created_at` |
| Événements V1 | `booking_pending_approval`, `booking_client_message`, `review_pending`, `support_ticket_open` |
| Fan-out | Users actifs avec la permission cible **ou** `super_admin` |
| Permissions | `bookings.read` / `reviews.read` / `support_tickets.read` |
| Hook admin | **API seule** — plus d’agrégation REST ni `localStorage` |
| Temps réel | Polling **45 s** + refetch au focus |
| Backfill | **Aucun** — inbox vide jusqu’aux nouveaux événements |
| WS / FCM | Hors scope |

## Règle sous test

| Élément | Comportement |
| ------- | ------------ |
| `GET /notifications` | Inbox du user courant (filtre `user_id`) |
| `GET /notifications/unread-count` | Nombre de lignes `read_at IS NULL` |
| `PATCH /notifications/:id/read` | Pose `read_at` (idempotent) |
| `POST /notifications/mark-all-read` | Marque toutes les non lues du user |
| Fan-out | N inserts (1 par destinataire) à l’événement ; échec fan-out **ne casse pas** le flux métier |
| Badge cloche | `unreadCount` issu de l’API ; cohérent après refresh / autre navigateur |

Migration : `database/migrations/add_staff_notifications.sql`

Prérequis :
1. Migration PR-12 appliquée.
2. Au moins 2 comptes staff avec `bookings.read` (navigateur A / B).
3. Client pour déclencher demande assistée / message / avis / ticket.

---

## Tests manuels

### A. Migration

1. Appliquer `add_staff_notifications.sql`.
2. Assert : table `notifications`, indexes `idx_notifications_user_created` / `idx_notifications_user_unread`, FK `user_id` → `users`.

### B. Fan-out — pending_approval

1. Client (ou staff pour client) → `POST /bookings/request` → status `pending_approval`.
2. Assert DB : une ligne `type = booking_pending_approval` **par** user staff avec `bookings.read` (+ super_admin).
3. Payload : `bookingId`, `href` type `/reservations?search=…`, `priority: high`.

### C. Fan-out — message client

1. Sur un booking assisté, client envoie un message.
2. Assert : lignes `booking_client_message` pour staff `bookings.read`.
3. Message **staff → client** : **pas** de nouvelle notif staff.

### D. Fan-out — avis + ticket

1. Client publie un avis → `review_pending` pour users `reviews.read`.
2. Création ticket `status = open` → `support_ticket_open` pour users `support_tickets.read`.
3. Ticket créé en `pending` (si possible) : **pas** de notif open.

### E. API list / mark read

```bash
# Liste
curl -s "$API/notifications?limit=50" -H "Authorization: Bearer $STAFF_TOKEN"
# Assert: uniquement les notifs de ce user

# Compteur
curl -s "$API/notifications/unread-count" -H "Authorization: Bearer $STAFF_TOKEN"
# Assert: count === nombre de read_at null

# Marquer lu
curl -s -X PATCH "$API/notifications/$ID/read" -H "Authorization: Bearer $STAFF_TOKEN"
# Assert: readAt non null ; 2e PATCH idempotent

# Tout lire
curl -s -X POST "$API/notifications/mark-all-read" -H "Authorization: Bearer $STAFF_TOKEN"
```

### F. Multi-navigateur (AC)

1. Staff user U : navigateur A + B connectés (même compte).
2. Déclencher un événement (ex. message client).
3. A et B : badge augmente (poll ≤ 45 s ou refresh).
4. Sur A : marquer la notif lue (cloche ou page `/notifications`).
5. Sur B : refresh / attendre poll → même notif **lue**, badge cohérent.
6. Assert : plus de dépendance à `localStorage` (`atg_admin_read_notifications` absent / ignoré).

### G. Hook admin

1. Admin → cloche + page `/notifications`.
2. Assert : items issus de `GET /notifications` (pas de `listBookings` / `listReviews` pour l’inbox).
3. Poll 45 s + focus fenêtre → refetch.
4. « Tout marquer comme lu » → `POST /mark-all-read` ; badge → 0.

---

## Fichiers clés

| Zone | Fichier |
| ---- | ------- |
| Migration | `database/migrations/add_staff_notifications.sql` |
| Entity / types | `apps/api/src/entities/notification.entity.ts`, `packages/types/src/notification.ts` |
| API | `apps/api/src/modules/resources/notifications/*` |
| Fan-out recipients | `PermissionsService.listUserIdsWithAnyPermission` |
| Hooks écriture | `bookings.service.ts`, `booking-messages.service.ts`, `reviews.service.ts`, `support-tickets.service.ts` |
| Client | `packages/api-client` (`listStaffNotifications`, `markStaffNotificationRead`, …) |
| Hook admin | `apps/admin/lib/notifications/use-admin-notifications.ts` |

---

## Hors scope

- WebSocket / SSE / FCM
- Email staff (emails assistés restent côté client)
- Backfill des pending historiques
- Marquer comme non lu côté API (`read_at` write-once V1)
- Purge / TTL automatique

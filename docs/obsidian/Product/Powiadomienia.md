---
tags:
  - notifications
  - opinie
  - product
  - supabase
---

# Powiadomienia

Powiadomienia są działającym modułem aplikacji NuvoRate, ale w obecnym MVP obejmują wyłącznie nowe opinie klientów.

## Aktualny zakres

NuvoRate tworzy i pokazuje tylko powiadomienia typu:

- `new_review`

Nie są obecnie tworzone powiadomienia dla:

- analizy reputacji,
- wygenerowanej odpowiedzi,
- limitów AI,
- subskrypcji,
- innych zdarzeń systemowych.

## UI

Powiadomienia są widoczne w:

- dzwonku w topbarze,
- badge przy pozycji „Powiadomienia” w sidebarze,
- stronie `/notifications`.

Dropdown pokazuje ostatnie 10 powiadomień `new_review`. Strona `/notifications` pokazuje pełną historię z paginacją po 10 rekordów.

## Interakcje

Użytkownik może:

- kliknąć powiadomienie i przejść do `/reviews`,
- automatycznie podświetlić konkretną opinię, jeśli `reviewId` jest zapisany w `message`,
- oznaczyć pojedyncze powiadomienie jako przeczytane,
- oznaczyć wszystkie powiadomienia jako przeczytane,
- wyczyścić historię powiadomień.

Po kliknięciu „Oznacz wszystkie jako przeczytane” przycisk zmienia tekst na „✓ Wszystkie przeczytane” i przechodzi w stan disabled, dopóki nie pojawi się nowe powiadomienie.

## Baza danych

Tabela:

- `notifications`

Najważniejsze kolumny:

- `id`
- `business_id`
- `type`
- `title`
- `message`
- `is_read`
- `created_at`

Aktualne odczyty UI filtrują po:

```sql
type = 'new_review'
```

Stare rekordy innych typów mogą istnieć w bazie, ale aplikacja ich nie pokazuje i nie liczy w badge.

## Tworzenie powiadomień

Powiadomienia o nowych opiniach tworzy trigger SQL `create_new_review_notification()`.

`message` powinien zawierać JSON z:

- `reviewId`
- `authorName`
- `rating`
- `contentPreview`

## Odpowiedzialne pliki

- `components/notifications/notification-bell.tsx`
- `components/notifications/notification-dropdown.tsx`
- `components/notifications/notification-sidebar-badge.tsx`
- `components/notifications/notification-history-actions.tsx`
- `components/notifications/notification-link.tsx`
- `app/notifications/page.tsx`
- `app/notifications/actions.ts`
- `app/api/notifications/[id]/read/route.ts`
- `app/api/notifications/read-all/route.ts`
- `lib/notification-ui.ts`
- `lib/notifications.ts`

## Ograniczenia

- Brak e-maili.
- Brak push notifications.
- Brak powiadomień o analizach, limitach i subskrypcjach.
- Czyszczenie historii usuwa tylko wpisy z `notifications`, bez wpływu na opinie, analizy i dane firmy.

## Powiązane notatki

- [[Opinie]]
- [[Dashboard MVP]]
- [[Supabase]]
- [[Backend]]
- [[Roadmap]]
- [[Product MOC]]

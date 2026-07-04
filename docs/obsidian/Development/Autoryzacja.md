---
tags:
  - auth
  - backend
  - development
  - supabase
---

# Autoryzacja

Autoryzacja NuvoRate opiera się na Supabase Auth i middleware Next.js.

## Strony auth

- `/register`: rejestracja konta i wybór planu.
- `/login`: logowanie.
- `/forgot-password`: wysłanie linku resetującego.
- `/update-password`: ustawienie nowego hasła.
- `/auth/callback`: wymiana kodu auth na sesję.

## Rejestracja

Formularz rejestracji:

- `components/auth/register-form.tsx`

Po rejestracji użytkownik jest kierowany do:

- `/checkout?plan=starter`,
- albo `/checkout?plan=business`.

Plan nie jest aktywowany przez samą rejestrację. Nowy profil ma `plan = unpaid`, a aktywacja następuje przez webhook Stripe.

## Logowanie

Formularz logowania:

- `components/auth/login-form.tsx`

Po zalogowaniu użytkownik trafia na `next` albo `/dashboard`.

## Middleware

Pliki:

- `middleware.ts`,
- `lib/supabase/middleware.ts`.

Middleware chroni:

- `/dashboard/:path*`,
- `/onboarding/:path*`.

Jeżeli użytkownik nie ma sesji, jest przekierowany do `/login?next=...`.

Ważne: `/reviews`, `/analysis` i `/nfc` nie są w matcherze middleware, ale same strony wykonują sprawdzenie sesji po stronie serwera i przekierowują niezalogowanych użytkowników.

## Profile użytkowników

Profil aplikacyjny znajduje się w `public.profiles` i jest powiązany z `auth.users` przez `user_id`.

Profil przechowuje:

- plan,
- dane Stripe,
- status subskrypcji,
- datę końca okresu rozliczeniowego.

## Dostęp do dashboardu

Pełny dostęp wymaga:

- sesji Supabase,
- profilu,
- firmy w `public.businesses`,
- płatnego planu `starter` albo `business`.

Plan `unpaid` pokazuje ekran wyboru planu.

## Mapa techniczna

- **Odpowiedzialne pliki**: `app/login/page.tsx`, `app/register/page.tsx`, `app/forgot-password/page.tsx`, `app/update-password/page.tsx`, `app/auth/callback/route.ts`, `middleware.ts`, `lib/supabase/middleware.ts`.
- **Komponenty**: `components/auth/login-form.tsx`, `components/auth/register-form.tsx`, `components/auth/forgot-password-form.tsx`, `components/auth/update-password-form.tsx`.
- **Używane tabele**: `profiles`, `businesses`.
- **Server actions**: `signOut` dla wylogowania z dashboard shell.
- **Route handlers**: `/auth/callback`.
- **Zależności**: Supabase Auth, [[Stripe]], [[Backend]], [[Supabase]].

## Powiązane notatki

- [[Backend]]
- [[Supabase]]
- [[Stripe]]
- [[MVP]]
- [[Development MOC]]

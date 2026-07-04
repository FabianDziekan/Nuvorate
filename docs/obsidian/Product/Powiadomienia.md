---
tags:
  - notifications
  - product
  - roadmap
---

# Powiadomienia

Powiadomienia są obecnie elementem planowanym. W kodzie istnieją ikony i pozycje nawigacji „Powiadomienia”, ale nie ma jeszcze działającego modułu powiadomień, tabeli zdarzeń ani kanałów wysyłki.

## Co istnieje w kodzie

- Ikona powiadomień w topbarze dashboardu, opinii, analizy i NFC.
- Pozycja „Powiadomienia” w sidebarze.
- Wizualna kropka przy ikonie powiadomień.

## Czego jeszcze nie ma

- Brak route `/notifications`.
- Brak tabeli `notifications`.
- Brak generowania powiadomień po nowej opinii.
- Brak alertów dla negatywnych opinii.
- Brak alertów o spadku średniej oceny.
- Brak ustawień kanałów powiadomień.

## Plan funkcji

Docelowo powiadomienia powinny obejmować:

- nową opinię,
- negatywną opinię,
- spadek średniej oceny,
- wykorzystanie limitu odpowiedzi lub analiz,
- zdarzenia billingowe.

Do czasu implementacji nie należy opisywać powiadomień jako gotowej funkcji sprzedażowej.

## Powiązane notatki

- [[Opinie]]
- [[Analiza]]
- [[Business]]
- [[Backend]]
- [[Roadmap]]
- [[Product MOC]]

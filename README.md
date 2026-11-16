# Rachid · shared-expense alpha

Rachid is a mobile-first, installable web alpha for trying the shared-expense workflow. It runs locally, works offline after its first load, and does not use a backend, database, account, or network API.

## Run locally

Requires Node.js 20 or newer. From the repository directory:

```sh
npm run dev
```

Open [http://localhost:4173](http://localhost:4173). The app can be installed from a supported browser (or added to the home screen on iOS). A static server is used only to serve the app shell and offline assets; it is not an application backend.

## Alpha features

- Start immediately with a four-person weekend-trip example.
- Create, rename, and reset groups; add and remove participants.
- Register expenses split equally, by percentage, or by exact custom amounts.
- View derived balances and suggested settlements; recording a settlement simulates a payment locally and updates balances.
- Switch between Portuguese (Brazil), English (US), and Spanish (Spain). The first launch follows the browser language; an explicit choice is retained as a language preference only.
- App data and simulated payments exist only in memory and reset when the page is restarted. The reset action restores the demo scenario.
- Offline support caches only application files and translations, not financial data.

All stored amounts in the running session are integer BRL cents. Locale-aware formatting is for display only. The UI calls an application service, which uses domain calculation functions and an in-memory repository. There is no remote persistence or financial transaction integration.

## Architecture

```text
Browser UI (src/app.js)
        ↓
ExpenseService (src/services/expense-service.js)
        ↓
Financial domain (src/finance.js)
        ↓
InMemoryExpenseRepository (src/repository.js) → demo state (src/demo.js)

UI copy → locales/{pt-BR,en-US,es-ES}.json
```

The service/repository boundary is the replacement seam for a future API-backed implementation. Production authentication, synchronization, invitations, audit history, receipts, external payments, reports, and notifications are intentionally out of scope for this database-free evaluation alpha.

## Validate

```sh
npm test
npm run build
```

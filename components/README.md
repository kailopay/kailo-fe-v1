# components

Shared, reusable UI components used across multiple routes or features.

- `ui/` — generic primitives (Button, Card, Input, Modal, ...)

Components used by a single route belong in that route's `_components` folder
(e.g. `app/(dashboard)/settings/_components/`). Components specific to one
domain (auth, payment, transactions) belong in `features/<domain>/`.

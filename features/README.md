# features

Feature-based modules. Each folder holds everything for one domain —
components, hooks, utils, and types — colocated together:

- `auth/` — session state, profile editing, Developer Mode opt-in, avatar
- `developer/` — API key list/create/revoke, one-time key reveal
- `orders/` — on-ramp order creation, QRIS/VA checkout rendering, status
  polling, order timeline

Keep `app/` pages thin: they compose and fetch, the feature folders own the
implementation. A component that is only ever used by one feature does not
belong in `components/`.

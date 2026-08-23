# features

Feature-based modules. Each folder holds everything for one domain —
components, hooks, utils, and types — colocated together:

- `auth/` — login, register, session UI and logic
- `payment/` — payment flows
- `transactions/` — transaction lists, details, filters

Keep `app/` pages thin: they compose and fetch, the feature folders own the
implementation. A component that is only ever used by one feature does not
belong in `components/`.

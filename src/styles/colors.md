Purpose
-------
This file documents the CSS custom properties (colors/shadows/helpers) added during the color-organizing sweep and the primary files where those exact color values were extracted from.

Notes
-----
- All variables are defined in `src/index.css`.
- Variables were added to preserve the exact visual values found in the codebase (no visual changes intended).
- The "origin" column lists representative files where the literal was found and then replaced with the variable.

Core variables (examples)
-----------------------
- `--color-bg`: #ffffff — core surface background (index.css)
- `--color-surface`: #ffffff — component surface background (index.css)
- `--white`: #ffffff — literal white (index.css)
- `--black`: #000000 — literal black (index.css)

Text & semantic
---------------
- `--color-text-primary`: #0f1722 — primary text (index.css)
- `--color-text-secondary`: #6c7278 — secondary text (index.css)
- `--color-text-on-accent`: #ffffff — text on accent (index.css)

Accent / brand
--------------
- `--color-accent`: #059669 — brand accent (index.css)
- `--color-accent-strong`: #058e5b — stronger accent (index.css)
- `--green`: #007948 — green used across UI (index.css)
- `--green-007948-0d`: #0079480d — translucent green used in Payment modal background (index.css)
- `--green-007948-10`: rgba(0, 121, 72, 0.1) — focus/shimmer helper (index.css)
- `--green-007948-15`: rgba(0, 121, 72, 0.15) — subtle shadow (index.css)

Status / badges / helpers
-------------------------
- `--badge-...` variables for paid/pending/overdue/etc. (index.css) — used in DataTable, Dashboard metrics
- `--color-border`, `--color-weak-border` (index.css) — borders originally in many components (DataTable, Inputs)

Shadows & translucents
----------------------
- `--shadow-very-weak`: rgba(16, 24, 40, 0.02) — small subtle shadows (index.css)
- `--shadow-weak`: rgba(16, 24, 40, 0.06) — typical card shadow (index.css)
- `--shadow-0-1`: rgba(34, 43, 69, 0.1) — used in modals (index.css)
- `--shadow-black-04`: rgba(0,0,0,0.04) — UI scrollbar/thumb fallback (index.css)

Logger / asset helpers
----------------------
- `--logger-debug`, `--logger-info`, `--logger-warn`, `--logger-error`, `--logger-success`
  - Added so `src/utils/logger.ts` can read color values at runtime (index.css).
- `--react-blue`: #00d8ff — used for `src/assets/react.svg` fill replacement (index.css)

Representative files updated (non-exhaustive)
---------------------------------------------
- `src/components/reusables/PaymentModal/PaymentModal.tsx` / `.css`
- `src/components/reusables/DataTable/DataTable.css`
- `src/components/reusables/EmptyState/EmptyState.css`
- `src/components/reusables/CurrencyDropdown/currencydropdown.css`
- `src/components/reusables/SlideIndicator/SlideIndicator.css`
- `src/components/reusables/ConfirmationModal/ConfirmationModal.css`
- `src/components/pages/DashoardPage/*`, `ServicesPage`, `CustomersPage`, `BillsPage`, `InvoicesPage`
- `src/components/reusables/preloader.css`
- `src/components/reusables/PageTitle/pagetitle.css`
- `src/assets/react.svg`
- `src/utils/logger.ts` (reads vars at runtime)

How to add a new color
----------------------
1. If you find a hard-coded color, add an exact-match variable to `src/index.css` (name must be descriptive).
2. Replace the literal in the source file with `var(--<name>)`.
3. Commit both changes together so visuals remain identical.

Questions / follow-ups
---------------------
- Want these variables grouped or renamed (BEM-like names, `--brand-...`, `--ui-...`)?
- Want a generated JSON mapping for programmatic usage (e.g. tokens import)?

End.



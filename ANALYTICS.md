# Analytics, data layer and secrets

This guide shares one GA4 property with vfaraji89.github.io (same domain, one journey).
`content_group: awesome-applied-ai` separates it in reports. The setup lives in
`web/src/components/analytics.tsx`; events are sent with `track()` from `web/src/lib/track.ts`.

## Consent and privacy
- Consent mode v2: ads storage always denied; analytics storage denied until the visitor says
  yes. The answer is shared with the portfolio (`localStorage['vf-consent']`, same origin) and a
  stored "yes" is applied before the first hit.
- Every event passes through `clean()`: emails, phone numbers and mailto/tel links are redacted,
  strings are capped at 100 characters. `page_location` drops `q`, `email`, `name`, `jd`, `cv`.
- Pasted CVs and job descriptions are never sent: only their length.
- Analytics is off on `localhost`.

## Data layer
| Push | Fields |
| --- | --- |
| `vf_context` | `site`, `page_group`, `consent_state` |
| gtag `config` | `content_group`, `site_section`, `page_location` (redacted) |

Page views on client-side navigation come from GA4 enhanced measurement ("page changes based on
browser history events"); keep it on in the data stream settings.

## Events
| Event | Where | Parameters |
| --- | --- | --- |
| `role_fit_check` | /fit/ | `mode` (cv or jd), `chars` |
| `skill_select` | /skills/ constellation | `skill` |
| `doors_toggle`, `doors_role` | /skills/ doors | `skill`, `role` |
| `radar_open` | /radar/ | `item`, `via` (card or bead) |
| `more_open` | any "Read more" | `label`, `page` |
| `github_repo`, `portfolio_click`, `cv_download`, `book_call` | links | `link_url`, `link_text` |

`?ga_debug=1` on any URL opens DebugView.

## Secrets
- The GA measurement ID is public by design and is not a secret.
- The tracker reads only public job boards and needs no keys. Anything CI ever needs goes in
  GitHub Actions secrets, never in the repo; `.env*` files are git-ignored.
- `scripts/secret-scan.mjs` runs on every push and pull request and fails on anything key-shaped
  or a committed secrets file. Before committing: `node scripts/secret-scan.mjs --staged`.
- If a key leaks: revoke and rotate it at the provider first, then remove it from the repo.

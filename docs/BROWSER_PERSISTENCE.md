# Browser persistence

`src/features/persistence/browserStorage.ts` is the boundary for
application-owned `localStorage` and `sessionStorage` records. It catches
unavailable/private-mode storage, distinguishes quota failures on writes,
validates reads through typed codecs, and fails closed for corrupt or obsolete
records. Payload `version` fields (or an explicitly versioned key where the
legacy contract already uses one) define the current record contract; legacy
records remain readable during migration and unknown versions fail closed.

## Key ownership

| Namespace/key | Storage | Owner boundary | Version |
| --- | --- | --- | --- |
| `quiz-attempt:<user>:<topic>` | local | authenticated user | payload `version: 1`; legacy unversioned payloads accepted |
| `engagement-outbox:<user>` | local | authenticated user | `{ version: 1, items }`; legacy arrays accepted |
| `day-skipper-passage-plan:<user>` | local | authenticated user | payload `version: 1` |
| `day-skipper-passage-plan:anonymous:<session>` | local | anonymous browser session | payload `version: 1` |
| `day-skipper-passage-plan-anonymous-session` | session | anonymous browser session | UUID identifier v1; legacy unquoted UUID accepted |
| `day-skipper-exam-session-v1` | session | embedded `ownerId` | key/payload v1 |

`clearOwnerPersistence` deletes only the signing-out owner's quiz, engagement,
passage-plan, and exam records. Account-switching components additionally key
or validate hydration by owner, so another user's data is never rendered.

Write failure is non-throwing: workflows retain their in-memory state and
continue to their authoritative Supabase write where one exists. Corrupt,
unknown-version, or unavailable reads return no record. Quota and unavailable
results are available to workflows that need user-visible recovery.

## Deliberate exceptions

- Supabase authentication storage is owned and refreshed by
  `@supabase/supabase-js`; the application never stores service-role keys or
  other secrets.
- Offline progress uses an IndexedDB queue because it needs transactional
  revision checks and replay. Records include `userId`, and replay APIs filter
  by that owner. The queue is intentionally retained on sign-out so unsynced
  work is not destroyed and cannot hydrate into another user's UI.

Do not add direct Web Storage access outside the boundary. New records require
a key ownership entry, codec/version, corrupt/obsolete tests, and an explicit
cleanup decision.

# Points trust model

Points are a motivational display only. They are not proof that a person read
lesson content, passed an independently proctored assessment, or acquired a
qualification. They must never grant authorization, unlock paid or scarce
resources, carry monetary value, or be used as a security decision.

Lesson completion is an authenticated user's declaration. A browser application
cannot prove that a human read the rendered text, and timers, click sequences,
or client-generated evidence are scriptable. The application therefore does not
describe those signals as verification.

The database still protects the integrity of the gamification counter:

- reward values come from a fixed database catalogue, never a caller amount;
- an immutable `(user_id, topic_id)` ledger caps each reward at one award;
- progress and profile-point mutations are unavailable directly to clients;
- the RPC derives the user from `auth.uid()` and atomically writes progress,
  ledger, and the profile projection;
- unknown topics and variable client-scored rewards receive no points.

If points ever become authoritative, eligibility must move to a server-owned
assessment or administrator workflow with evidence the browser cannot mint.

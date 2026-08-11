# Readiness retention deployment

No periodic sweep is configured by this repository. Operators may schedule
`select public.expire_all_readiness_record_progress();` at least daily using
the Supabase project's scheduled database job as `service_role`. The
function is not learner-executable and redacts expired readiness evidence,
completion and score for every owner. Access-triggered cleanup remains enabled
as defence in depth. Deployment is incomplete until this job is visible in the
project's scheduled-jobs dashboard. Until then, expiry is enforced and evidence
is redacted when that learner next accesses or writes the readiness record; the
30-day timestamp is an eligibility boundary, not a promise of deletion at the
exact instant it passes.

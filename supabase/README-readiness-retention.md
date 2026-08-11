# Readiness retention deployment

Schedule `select public.expire_all_readiness_record_progress();` at least daily
using the Supabase project's scheduled database job as `service_role`. The
function is not learner-executable and redacts expired readiness evidence,
completion and score for every owner. Access-triggered cleanup remains enabled
as defence in depth. Deployment is incomplete until this job is visible in the
project's scheduled-jobs dashboard.

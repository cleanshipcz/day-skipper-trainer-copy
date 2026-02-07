-- Add unique constraint to user_progress to support upsert operations
ALTER TABLE public.user_progress 
ADD CONSTRAINT user_progress_user_topic_unique UNIQUE (user_id, topic_id);
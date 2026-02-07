-- Add points field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN points integer DEFAULT 0;

-- Add answers_history to user_progress to support backtracking
ALTER TABLE public.user_progress
ADD COLUMN answers_history jsonb DEFAULT '[]'::jsonb;

-- Create indexes for better performance
CREATE INDEX idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX idx_quiz_scores_user_id ON public.quiz_scores(user_id);
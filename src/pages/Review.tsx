import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthHooks";
import { supabase } from "@/integrations/supabase/client";
import { fetchDueQuestions, recordReview } from "@/features/spaced-repetition/reviewService";
import { qualityForAnswer } from "@/features/spaced-repetition/sm2";
import type { DueReview } from "@/features/spaced-repetition/reviewQuestions";
import type { QuestionReview } from "@/features/spaced-repetition/reviewService";

const Review = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id ?? null;
  const [reviews, setReviews] = useState<readonly DueReview<QuestionReview>[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [reviewId, setReviewId] = useState(() => crypto.randomUUID());
  const [reviewedAt, setReviewedAt] = useState(() => new Date());
  const [reviewed, setReviewed] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [stateOwner, setStateOwner] = useState<string | null>(null);
  const [stateGeneration, setStateGeneration] = useState(-1);
  const identityRef = useRef(userId);
  const generationRef = useRef(0);
  if (identityRef.current !== userId) {
    identityRef.current = userId;
    generationRef.current += 1;
  }

  const load = useCallback(async () => {
    const generation = ++generationRef.current;
    setReviews([]);
    setSelected(null);
    setRevealed(false);
    setSaving(false);
    setSaveError(false);
    setReviewed(0);
    setCorrect(0);
    setReviewId(crypto.randomUUID());
    setReviewedAt(new Date());
    setStateOwner(userId);
    setStateGeneration(generation);
    if (!userId) {
      setReviews([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(false);
    try {
      const result = await fetchDueQuestions(supabase, userId);
      if (generation === generationRef.current && identityRef.current === userId) setReviews(result);
    } catch {
      if (generation === generationRef.current && identityRef.current === userId) setLoadError(true);
    } finally {
      if (generation === generationRef.current && identityRef.current === userId) setLoading(false);
    }
  }, [userId]);

  useEffect(() => { void load(); }, [load]);

  if (authLoading || loading || stateOwner !== userId || stateGeneration !== generationRef.current)
    return <main className="min-h-screen grid place-items-center">Loading reviews…</main>;

  if (!user) {
    return <main className="min-h-screen grid place-items-center p-4"><Card><CardHeader><CardTitle>Sign in to review</CardTitle></CardHeader>
      <CardContent><Button onClick={() => navigate("/auth")}>Sign in</Button></CardContent></Card></main>;
  }

  if (loadError) {
    return <main className="min-h-screen grid place-items-center p-4"><Card><CardHeader><CardTitle>Reviews unavailable</CardTitle></CardHeader>
      <CardContent className="space-y-3"><p>Your schedule was not changed. Check your connection and try again.</p>
        <Button onClick={() => void load()}><RotateCcw className="mr-2 h-4 w-4" />Retry</Button></CardContent></Card></main>;
  }

  const current = reviews[0];
  if (!current) {
    return <main className="min-h-screen grid place-items-center p-4"><Card className="max-w-lg w-full text-center">
      <CardHeader><CheckCircle2 className="h-12 w-12 mx-auto text-success" /><CardTitle>Review complete</CardTitle></CardHeader>
      <CardContent className="space-y-4"><p>{reviewed === 0 ? "No questions are due today." : `${reviewed} reviewed · ${correct} correct`}</p>
        <Button onClick={() => navigate("/")}><ArrowLeft className="mr-2 h-4 w-4" />Dashboard</Button></CardContent></Card></main>;
  }

  const isCorrect = selected === current.question.correctAnswer;
  const saveAndContinue = async () => {
    if (selected === null) return;
    const generation = generationRef.current;
    const owner = userId;
    const savedReviewId = reviewId;
    const savedQuestionId = current.question.id;
    setSaving(true);
    setSaveError(false);
    try {
      await recordReview(supabase, savedQuestionId, qualityForAnswer(isCorrect), savedReviewId, reviewedAt);
      if (generation !== generationRef.current || identityRef.current !== owner) return;
      setReviews((items) => items.slice(1));
      setReviewed((count) => count + 1);
      if (isCorrect) setCorrect((count) => count + 1);
      setSelected(null);
      setRevealed(false);
      setReviewId(crypto.randomUUID());
      setReviewedAt(new Date());
    } catch {
      if (generation === generationRef.current && identityRef.current === owner) setSaveError(true);
    } finally {
      if (generation === generationRef.current && identityRef.current === owner) setSaving(false);
    }
  };

  return <main className="min-h-screen bg-gradient-to-br from-background via-ocean-light/10 to-background p-4">
    <div className="max-w-2xl mx-auto py-8 space-y-4">
      <Button variant="ghost" onClick={() => navigate("/")}><ArrowLeft className="mr-2 h-4 w-4" />Dashboard</Button>
      <Progress value={(reviewed / (reviewed + reviews.length)) * 100} />
      <Card><CardHeader><p className="text-sm text-muted-foreground">{current.topicId}</p>
        <CardTitle>{current.question.question}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {current.question.options.map((option, index) => <Button key={option} variant={selected === index ? "default" : "outline"}
            className="w-full justify-start h-auto whitespace-normal text-left" disabled={revealed}
            onClick={() => setSelected(index)}>{option}</Button>)}
          {!revealed ? <Button className="w-full" disabled={selected === null} onClick={() => setRevealed(true)}>Check answer</Button>
            : <div className="space-y-3"><p className={isCorrect ? "text-success font-semibold" : "text-destructive font-semibold"}>
              {isCorrect ? "Correct" : "Not quite"}</p><p>{current.question.explanation}</p>
              {saveError && <p role="alert" className="text-destructive">Could not save. Your answer is still here; retry when connected.</p>}
              <Button className="w-full" disabled={saving} onClick={() => void saveAndContinue()}>
                {saving ? "Saving…" : saveError ? "Retry saving" : "Save and continue"}</Button></div>}
        </CardContent></Card>
    </div>
  </main>;
};

export default Review;

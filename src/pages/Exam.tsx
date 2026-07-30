import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Flag, History, Timer, Trophy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthHooks";
import { quizRegistry, topicMeta } from "@/data/quizzes";
import { remainingSeconds, scoreExam, selectExamQuestions } from "@/features/exam/examEngine";
import { clampInteger, parseExamSession, sessionBelongsTo, type ExamSession } from "@/features/exam/examSession";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "day-skipper-exam-session-v1";
const readSession = () => parseExamSession(sessionStorage.getItem(STORAGE_KEY));

export default function Exam() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const userId = user?.id ?? null;
  const [questionCount, setQuestionCount] = useState(48);
  const [durationMinutes, setDurationMinutes] = useState(100);
  const [passMark, setPassMark] = useState(65);
  const [session, setSession] = useState<ExamSession | null>(() => readSession());
  const [seconds, setSeconds] = useState(() => session ? remainingSeconds(session.startedAt, session.durationSeconds) : 0);
  const submissionLock = useRef(false);
  const identityRef = useRef<string | null>(userId);
  const sessionRef = useRef<ExamSession | null>(session);
  const saveGenerationRef = useRef(0);
  if (identityRef.current !== userId) {
    identityRef.current = userId;
    saveGenerationRef.current += 1;
  }

  const save = useCallback((next: ExamSession) => {
    sessionRef.current = next;
    setSession(next);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const clearSession = useCallback(() => {
    saveGenerationRef.current += 1;
    sessionRef.current = null;
    sessionStorage.removeItem(STORAGE_KEY);
    setSession(null);
    submissionLock.current = false;
  }, []);

  const start = () => {
    const safeCount = clampInteger(questionCount, 48, 10, 100);
    const safeMinutes = clampInteger(durationMinutes, 100, 5, 240);
    const safePassMark = clampInteger(passMark, 65, 1, 100);
    setQuestionCount(safeCount); setDurationMinutes(safeMinutes); setPassMark(safePassMark);
    const questions = selectExamQuestions(quizRegistry, safeCount);
    const next: ExamSession = {
      ownerId: userId, attemptId: crypto.randomUUID(), questions, answers: Array(questions.length).fill(null),
      flagged: [], current: 0, startedAt: Date.now(), durationSeconds: safeMinutes * 60,
      passMark: safePassMark, submitted: false, elapsedSeconds: null, saveStatus: "pending",
    };
    save(next); setSeconds(next.durationSeconds);
  };

  const persist = useCallback(async (candidate: ExamSession) => {
    if (!user || candidate.ownerId !== identityRef.current || !candidate.submitted ||
      candidate.saveStatus === "saved" || candidate.saveStatus === "saving") return;
    const requestGeneration = saveGenerationRef.current;
    const saving = { ...candidate, saveStatus: "saving" as const };
    save(saving);
    const scored = scoreExam(candidate.questions, candidate.answers, candidate.passMark);
    const { error } = await supabase.rpc("submit_exam_result", {
      p_attempt_id: candidate.attemptId, p_score: scored.score,
      p_total_questions: candidate.questions.length, p_time_taken_seconds: candidate.elapsedSeconds ?? 0,
      p_topic_breakdown: scored.topicBreakdown, p_pass_mark: candidate.passMark,
    });
    if (candidate.ownerId === identityRef.current &&
      requestGeneration === saveGenerationRef.current &&
      sessionRef.current?.attemptId === candidate.attemptId) {
      save({ ...saving, saveStatus: error ? "failed" : "saved" });
      if (error) toast.error("Result was retained locally. Retry saving when ready.");
    }
  }, [save, user]);

  const submit = useCallback(async () => {
    if (!session || session.submitted || submissionLock.current) return;
    submissionLock.current = true;
    const elapsedSeconds = Math.min(session.durationSeconds, Math.max(0, Math.floor((Date.now() - session.startedAt) / 1000)));
    const completed: ExamSession = { ...session, submitted: true, elapsedSeconds, saveStatus: "pending" };
    save(completed);
    try {
      await persist(completed);
    } finally {
      submissionLock.current = false;
    }
  }, [persist, save, session]);

  useEffect(() => {
    if (loading || !session || sessionBelongsTo(session, userId)) return;
    clearSession();
  }, [clearSession, loading, session, userId]);

  useEffect(() => {
    if (!session || session.submitted) return;
    const tick = () => {
      const left = remainingSeconds(session.startedAt, session.durationSeconds);
      setSeconds(left);
      if (left === 0) void submit();
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [session, submit]);

  if (loading || (session && !sessionBelongsTo(session, userId)))
    return <main className="container mx-auto p-6" aria-live="polite">Loading exam…</main>;
  if (!session) return <main className="container max-w-2xl mx-auto p-6">
    <Card><CardHeader><CardTitle className="flex gap-2"><Trophy /> Mock Exam</CardTitle></CardHeader>
      <CardContent className="space-y-5">
        <p>Questions are weighted across all syllabus topics. Explanations remain hidden until submission.</p>
        <p className="text-sm font-medium text-amber-700">Practice only: results are self-assessed, non-certifying, and are not an official RYA examination result.</p>
        <label className="block">Questions<input aria-label="Question count" className="block w-full border rounded p-2" type="number" min={10} max={100}
          value={questionCount} onChange={(e) => setQuestionCount(clampInteger(e.target.value, 48, 10, 100))} /></label>
        <label className="block">Duration (minutes)<input aria-label="Duration" className="block w-full border rounded p-2" type="number" min={5} max={240}
          value={durationMinutes} onChange={(e) => setDurationMinutes(clampInteger(e.target.value, 100, 5, 240))} /></label>
        <label className="block">Practice pass mark (%)<input aria-label="Pass mark" className="block w-full border rounded p-2" type="number" min={1} max={100}
          value={passMark} onChange={(e) => setPassMark(clampInteger(e.target.value, 65, 1, 100))} /></label>
        <div className="flex gap-2"><Button onClick={start}>Start exam</Button>
          <Button variant="outline" onClick={() => navigate("/exam/history")}><History className="mr-2 h-4 w-4" />History</Button></div>
      </CardContent></Card>
  </main>;

  const scored = session.submitted ? scoreExam(session.questions, session.answers, session.passMark) : null;
  if (scored) return <main className="container max-w-4xl mx-auto p-6 space-y-6">
    <Card><CardHeader><CardTitle>{scored.passed ? "Practice pass" : "Keep practising"} — {scored.percentage}%</CardTitle></CardHeader>
      <CardContent><p>{scored.score}/{session.questions.length} correct · {Math.floor((session.elapsedSeconds ?? 0) / 60)}m {(session.elapsedSeconds ?? 0) % 60}s</p>
        <p className="text-sm text-muted-foreground mt-1">Self-assessed practice result only; this is not certification.</p>
        <p className="text-sm mt-2">Save status: {session.saveStatus}</p>
        {user && (session.saveStatus === "failed" || session.saveStatus === "pending") &&
          <Button className="mt-2" onClick={() => void persist(session)}>Retry saving this attempt</Button>}
        <div className="mt-4 grid sm:grid-cols-2 gap-2">{Object.entries(scored.topicBreakdown).map(([topic, item]) =>
          <div key={topic} className="border rounded p-3">{topicMeta[topic]?.title ?? topic}: {item.correct}/{item.total} ({item.percentage}%)</div>)}</div>
      </CardContent></Card>
    {session.questions.map((question, index) => session.answers[index] !== question.correctAnswer && <Card key={`${question.topicId}:${question.id}`}>
      <CardContent className="pt-5"><p className="font-semibold">{question.question}</p>
        <p className="text-sm mt-2">Correct: {question.options[question.correctAnswer]}</p><p className="text-sm text-muted-foreground">{question.explanation}</p></CardContent></Card>)}
    <div className="flex gap-2"><Button onClick={clearSession}>New attempt</Button>
      <Button variant="outline" onClick={() => navigate("/exam/history")}>View history</Button></div>
  </main>;

  const question = session.questions[session.current];
  const updateAnswer = (answer: number) => { const answers = [...session.answers]; answers[session.current] = answer; save({ ...session, answers }); };
  const toggleFlag = () => save({ ...session, flagged: session.flagged.includes(session.current)
    ? session.flagged.filter((value) => value !== session.current) : [...session.flagged, session.current] });
  return <main className="container max-w-3xl mx-auto p-6 space-y-4">
    <div className="flex justify-between"><strong>Question {session.current + 1}/{session.questions.length}</strong>
      <span className="flex gap-2" role="timer" aria-label={`${Math.floor(seconds / 60)} minutes ${seconds % 60} seconds remaining`}>
        <Timer aria-hidden="true" />{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}</span></div>
    <Progress value={((session.current + 1) / session.questions.length) * 100} />
    <Card><CardHeader><CardTitle className="text-xl">{question.question}</CardTitle></CardHeader>
      <CardContent className="space-y-2">{question.options.map((option, index) => <Button key={`${index}:${option}`} className="w-full justify-start h-auto py-3"
        variant={session.answers[session.current] === index ? "default" : "outline"} role="radio"
        aria-checked={session.answers[session.current] === index} onClick={() => updateAnswer(index)}>{option}</Button>)}</CardContent></Card>
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" disabled={session.current === 0} onClick={() => save({ ...session, current: session.current - 1 })}>Previous</Button>
      <Button variant="outline" disabled={session.current === session.questions.length - 1} onClick={() => save({ ...session, current: session.current + 1 })}>Next</Button>
      <Button variant={session.flagged.includes(session.current) ? "default" : "outline"}
        aria-pressed={session.flagged.includes(session.current)} onClick={toggleFlag}><Flag className="mr-2 h-4 w-4" />Flag</Button>
      <Button className="ml-auto" onClick={() => void submit()}>Submit exam</Button>
    </div>
    <p className="text-sm text-muted-foreground">{session.answers.filter((answer) => answer !== null).length} answered · {session.flagged.length} flagged. Unanswered questions count as incorrect.</p>
  </main>;
}

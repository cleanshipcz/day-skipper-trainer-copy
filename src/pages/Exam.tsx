import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Flag, History, Timer, Trophy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthHooks";
import { quizRegistry, topicMeta } from "@/data/quizzes";
import { remainingSeconds, scoreExam, selectExamQuestions, type ExamQuestion } from "@/features/exam/examEngine";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "day-skipper-exam-session-v1";
type Session = {
  attemptId: string; questions: ExamQuestion[]; answers: (number | null)[];
  flagged: number[]; current: number; startedAt: number; durationSeconds: number; submitted: boolean;
};

const readSession = (): Session | null => {
  try {
    const value = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "null") as Session | null;
    return value?.attemptId && Array.isArray(value.questions) && value.questions.length ? value : null;
  } catch { return null; }
};

export default function Exam() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [questionCount, setQuestionCount] = useState(48);
  const [durationMinutes, setDurationMinutes] = useState(100);
  const [session, setSession] = useState<Session | null>(() => readSession());
  const [seconds, setSeconds] = useState(() => session ? remainingSeconds(session.startedAt, session.durationSeconds) : 0);
  const [result, setResult] = useState<ReturnType<typeof scoreExam> | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const save = (next: Session) => { setSession(next); sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next)); };
  const start = () => {
    const questions = selectExamQuestions(quizRegistry, questionCount);
    const next: Session = {
      attemptId: crypto.randomUUID(), questions, answers: Array(questions.length).fill(null),
      flagged: [], current: 0, startedAt: Date.now(), durationSeconds: durationMinutes * 60, submitted: false,
    };
    save(next); setSeconds(next.durationSeconds);
  };

  const submit = useCallback(async () => {
    if (!session || session.submitted || submitting) return;
    setSubmitting(true);
    const scored = scoreExam(session.questions, session.answers);
    const completed = { ...session, submitted: true };
    save(completed);
    setResult(scored);
    if (user) {
      const elapsed = Math.min(session.durationSeconds, Math.max(0, Math.floor((Date.now() - session.startedAt) / 1000)));
      const { error } = await supabase.rpc("submit_exam_result", {
        p_attempt_id: session.attemptId, p_score: scored.score,
        p_total_questions: session.questions.length, p_time_taken_seconds: elapsed,
        p_topic_breakdown: scored.topicBreakdown,
      });
      if (error) toast.error("Result could not be saved. You can safely retry.");
    }
    setSubmitting(false);
  }, [session, submitting, user]);

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

  if (!session) return (
    <main className="container max-w-2xl mx-auto p-6">
      <Card><CardHeader><CardTitle className="flex gap-2"><Trophy /> Mock Exam</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <p>Questions are weighted across all syllabus topics. Explanations remain hidden until submission.</p>
          <label className="block">Questions
            <input aria-label="Question count" className="block w-full border rounded p-2" type="number" min={10} max={100}
              value={questionCount} onChange={(e) => setQuestionCount(Number(e.target.value))} />
          </label>
          <label className="block">Duration (minutes)
            <input aria-label="Duration" className="block w-full border rounded p-2" type="number" min={5} max={240}
              value={durationMinutes} onChange={(e) => setDurationMinutes(Number(e.target.value))} />
          </label>
          <div className="flex gap-2"><Button onClick={start}>Start exam</Button>
            <Button variant="outline" onClick={() => navigate("/exam/history")}><History className="mr-2 h-4 w-4" />History</Button></div>
        </CardContent></Card>
    </main>
  );

  const scored = result ?? (session.submitted ? scoreExam(session.questions, session.answers) : null);
  if (scored) return (
    <main className="container max-w-4xl mx-auto p-6 space-y-6">
      <Card><CardHeader><CardTitle>{scored.passed ? "Passed" : "Keep practising"} — {scored.percentage}%</CardTitle></CardHeader>
        <CardContent><p>{scored.score}/{session.questions.length} correct</p>
          <div className="mt-4 grid sm:grid-cols-2 gap-2">{Object.entries(scored.topicBreakdown).map(([topic, item]) =>
            <div key={topic} className="border rounded p-3">{topicMeta[topic]?.title ?? topic}: {item.correct}/{item.total} ({item.percentage}%)</div>)}</div>
        </CardContent></Card>
      {session.questions.map((question, index) => session.answers[index] !== question.correctAnswer && (
        <Card key={`${question.topicId}:${question.id}`}><CardContent className="pt-5">
          <p className="font-semibold">{question.question}</p>
          <p className="text-sm mt-2">Correct: {question.options[question.correctAnswer]}</p>
          <p className="text-sm text-muted-foreground">{question.explanation}</p>
        </CardContent></Card>
      ))}
      <div className="flex gap-2"><Button onClick={() => { sessionStorage.removeItem(STORAGE_KEY); setSession(null); setResult(null); }}>Retry</Button>
        <Button variant="outline" onClick={() => navigate("/exam/history")}>View history</Button></div>
    </main>
  );

  const question = session.questions[session.current];
  const updateAnswer = (answer: number) => {
    const answers = [...session.answers]; answers[session.current] = answer; save({ ...session, answers });
  };
  const toggleFlag = () => save({ ...session, flagged: session.flagged.includes(session.current)
    ? session.flagged.filter((value) => value !== session.current) : [...session.flagged, session.current] });
  return (
    <main className="container max-w-3xl mx-auto p-6 space-y-4">
      <div className="flex justify-between"><strong>Question {session.current + 1}/{session.questions.length}</strong>
        <span className="flex gap-2"><Timer />{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}</span></div>
      <Progress value={((session.current + 1) / session.questions.length) * 100} />
      <Card><CardHeader><CardTitle className="text-xl">{question.question}</CardTitle></CardHeader>
        <CardContent className="space-y-2">{question.options.map((option, index) =>
          <Button key={option} className="w-full justify-start h-auto py-3" variant={session.answers[session.current] === index ? "default" : "outline"}
            onClick={() => updateAnswer(index)}>{option}</Button>)}</CardContent></Card>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" disabled={session.current === 0} onClick={() => save({ ...session, current: session.current - 1 })}>Previous</Button>
        <Button variant="outline" disabled={session.current === session.questions.length - 1} onClick={() => save({ ...session, current: session.current + 1 })}>Next</Button>
        <Button variant={session.flagged.includes(session.current) ? "default" : "outline"} onClick={toggleFlag}><Flag className="mr-2 h-4 w-4" />Flag</Button>
        <Button className="ml-auto" disabled={submitting} onClick={() => void submit()}>Submit exam</Button>
      </div>
      <p className="text-sm text-muted-foreground">{session.answers.filter((answer) => answer !== null).length} answered · {session.flagged.length} flagged. Unanswered questions count as incorrect.</p>
    </main>
  );
}

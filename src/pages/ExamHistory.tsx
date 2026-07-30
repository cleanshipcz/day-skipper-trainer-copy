import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthHooks";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export default function ExamHistory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id;
  const [results, setResults] = useState<Tables<"exam_results">[]>([]);
  useEffect(() => {
    let active = true;
    setResults([]);
    if (!userId) return () => { active = false; };
    const requestedUserId = userId;
    void supabase.from("exam_results").select("*").eq("user_id", requestedUserId).order("completed_at", { ascending: false })
      .then(({ data }) => { if (active) setResults(data ?? []); });
    return () => { active = false; };
  }, [userId]);
  const trend = [...results].reverse().map((item, index) => ({ attempt: index + 1, percentage: item.percentage }));
  return <main className="container max-w-4xl mx-auto p-6 space-y-5">
    <div className="flex justify-between"><h1 className="text-3xl font-bold">Exam history</h1><Button onClick={() => navigate("/exam")}>Take exam</Button></div>
    {!user && <Card><CardContent className="pt-5">Sign in to save and view exam attempts.</CardContent></Card>}
    {trend.length > 1 && <Card><CardHeader><CardTitle>Score trend</CardTitle></CardHeader><CardContent className="h-64">
      <ResponsiveContainer width="100%" height="100%"><LineChart data={trend}><XAxis dataKey="attempt" /><YAxis domain={[0, 100]} /><Tooltip /><Line dataKey="percentage" stroke="hsl(var(--primary))" /></LineChart></ResponsiveContainer>
    </CardContent></Card>}
    <p className="text-sm text-muted-foreground">Self-assessed practice records only; these are not certifying exam results.</p>
    {results.map((item) => <Card key={item.id}><CardContent className="pt-5 flex justify-between">
      <div><strong>{item.percentage}% — {item.passed ? "Passed" : "Not passed"}</strong><p className="text-sm text-muted-foreground">{new Date(item.completed_at).toLocaleString()}</p></div>
      <span>{item.score}/{item.total_questions} · {Math.floor(item.time_taken_seconds / 60)} min</span>
    </CardContent></Card>)}
    {user && !results.length && <p>No completed exams yet.</p>}
  </main>;
}

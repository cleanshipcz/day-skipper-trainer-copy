import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Anchor,
  Link2,
  Ship,
  Wrench,
  Fuel,
  CheckCircle2,
  Trophy,
  BookOpen,
  User,
  LogOut,
  Compass,
  Map,
  LifeBuoy,
  Navigation,
  CloudSun,
  Route,
  ClipboardCheck,
  Brain,
  Flame,
  Award,
  FileDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthHooks";
import { supabase } from "@/integrations/supabase/client";
import { deriveTopicCompletionState } from "@/features/dashboard/topicCompletion";
import { ModuleMenuGrid } from "@/components/module-menu/ModuleMenuGrid";
import type { ModuleMenuItem } from "@/components/module-menu/types";
import { getRootTopics, type TopicEntry } from "@/constants/topicRegistry";
import { useDueReviewCount } from "@/features/spaced-repetition/useDueReviewCount";
import { badgeById, type BadgeDefinition } from "@/data/badges";
import { calculateStreak, fetchAllStreakTimestamps } from "@/features/engagement/streaks";
import { retryEngagementOutbox } from "@/features/engagement/engagementService";
import { toast } from "sonner";
import { buildProgressReportData, downloadProgressReport } from "@/features/export/progressReport";

/**
 * Dashboard display metadata for root topics. Keyed by topic registry ID.
 * Only visual/UI concerns live here — structural data comes from the registry.
 */
const topicDisplayMeta: Record<string, {
  description: string;
  icon: React.ElementType;
  color: string;
  menuColor: string;
}> = {
  "nautical-terms": {
    description: "Interactive boat diagram to learn parts and terminology",
    icon: Ship,
    color: "text-ocean",
    menuColor: "from-cyan-500 to-blue-600",
  },
  ropework: {
    description: "Master essential knots with visual guides",
    icon: Link2,
    color: "text-rope",
    menuColor: "from-amber-500 to-orange-600",
  },
  anchorwork: {
    description: "Anchoring techniques and procedures",
    icon: Anchor,
    color: "text-primary",
    menuColor: "from-sky-500 to-indigo-600",
  },
  victualling: {
    description: "Planning and managing provisions for sea",
    icon: Fuel,
    color: "text-secondary",
    menuColor: "from-emerald-500 to-teal-600",
  },
  engine: {
    description: "Essential engine maintenance procedures",
    icon: Wrench,
    color: "text-accent",
    menuColor: "from-violet-500 to-fuchsia-600",
  },
  rig: {
    description: "Pre-sea rig inspection and preparation",
    icon: CheckCircle2,
    color: "text-success",
    menuColor: "from-green-500 to-emerald-600",
  },
  "rules-of-the-road": {
    description: "Steering Rules (Part B) and Lights (Part C)",
    icon: Compass,
    color: "text-red-500",
    menuColor: "from-rose-500 to-red-600",
  },
  navigation: {
    description: "Charts, Compass, and Position Fixing",
    icon: Map,
    color: "text-blue-500",
    menuColor: "from-blue-500 to-cyan-600",
  },
  pilotage: {
    description: "Transits, Leading Lines, and Harbour Navigation",
    icon: Navigation,
    color: "text-teal-500",
    menuColor: "from-teal-500 to-cyan-600",
  },
  safety: {
    description: "Man Overboard, Distress Signals, and Emergency Drills",
    icon: LifeBuoy,
    color: "text-red-500",
    menuColor: "from-red-500 to-orange-600",
  },
  weather: {
    description: "Weather systems, wind force, forecasts, fog and visibility",
    icon: CloudSun,
    color: "text-sky-500",
    menuColor: "from-sky-500 to-indigo-600",
  },
  "passage-planning": {
    description: "PREPARE, passage calculations, route plans and departure checks",
    icon: Route,
    color: "text-indigo-500",
    menuColor: "from-indigo-500 to-purple-600",
  },
};

interface DashboardTopic {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  path: string;
  color: string;
  completed: boolean;
  submoduleIds?: readonly string[];
  menuColor: string;
}

/** Derive dashboard topics from the registry + display metadata. */
const buildDashboardTopics = (): DashboardTopic[] =>
  getRootTopics().map((entry: TopicEntry) => {
    const meta = topicDisplayMeta[entry.id] ?? {
      description: entry.label,
      icon: BookOpen,
      color: "text-muted-foreground",
      menuColor: "from-gray-500 to-gray-600",
    };
    return {
      id: entry.id,
      title: entry.label,
      description: meta.description,
      icon: meta.icon,
      path: entry.route,
      color: meta.color,
      completed: false,
      submoduleIds: entry.submoduleIds.length > 0 ? entry.submoduleIds : undefined,
      menuColor: meta.menuColor,
    };
  });

const topics = buildDashboardTopics();

interface UserProfile {
  id: string;
  points: number;
  username: string;
}

interface UserProgressData {
  topic_id: string;
  completed: boolean;
  score: number;
}

const Index = () => {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const [points, setPoints] = useState(0);
  const [progress, setProgress] = useState(0);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [topicsCompleted, setTopicsCompleted] = useState(0);
  const [avgQuizScore, setAvgQuizScore] = useState(0);
  const [quizScores, setQuizScores] = useState<readonly {
    topic_id: string;
    percentage: number;
    completed_at: string;
    attempt_id: string;
  }[]>([]);
  const [userProgress, setUserProgress] = useState<Record<string, UserProgressData>>({});
  const [dashboardOwner, setDashboardOwner] = useState<string | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [earnedBadges, setEarnedBadges] = useState<readonly BadgeDefinition[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [engagementOwner, setEngagementOwner] = useState<string | null>(null);
  const [engagementLoading, setEngagementLoading] = useState(false);
  const [engagementError, setEngagementError] = useState(false);
  const currentUserId = user?.id ?? null;
  const dashboardOwnerRef = React.useRef(currentUserId);
  const dashboardGenerationRef = React.useRef(0);
  dashboardOwnerRef.current = currentUserId;
  const dashboardReady = Boolean(currentUserId && dashboardOwner === currentUserId && !dashboardLoading);
  const visiblePoints = dashboardReady ? points : 0;
  const visibleProgress = dashboardReady ? progress : 0;
  const visibleTopicsCompleted = dashboardReady ? topicsCompleted : 0;
  const visibleAvgQuizScore = dashboardReady ? avgQuizScore : 0;
  const visibleProfile = dashboardReady ? profile : null;
  const visibleUserProgress = dashboardReady ? userProgress : {};
  const engagementOwnerRef = React.useRef(currentUserId);
  engagementOwnerRef.current = currentUserId;
  const visibleDueReviews = useDueReviewCount(currentUserId);

  const fetchProfile = React.useCallback(async (owner: string, generation: number) => {
    const { data } = await supabase.from("profiles").select("*").eq("user_id", owner).single();
    if (dashboardOwnerRef.current !== owner || dashboardGenerationRef.current !== generation) return;

    if (data) {
      setProfile(data as UserProfile);
      setPoints(data.points || 0);
    }
  }, []);

  const fetchProgress = React.useCallback(async (owner: string, generation: number) => {
    // Fetch user progress for all topics
    const { data: progressData } = await supabase.from("user_progress").select("*").eq("user_id", owner);
    if (dashboardOwnerRef.current !== owner || dashboardGenerationRef.current !== generation) return;

    if (progressData) {
      const progressMap = progressData.reduce((acc, item) => {
        acc[item.topic_id] = item as UserProgressData;
        return acc;
      }, {} as Record<string, UserProgressData>);
      setUserProgress(progressMap);

      const completedCount = topics.reduce((count, topic) => {
        const { isCompleted } = deriveTopicCompletionState(topic, progressMap);
        return count + (isCompleted ? 1 : 0);
      }, 0);

      setTopicsCompleted(completedCount);
      setProgress(Math.round((completedCount / topics.length) * 100));
    }

    // Fetch quiz scores
    const { data: scoresData } = await supabase
      .from("quiz_scores")
      .select("topic_id, percentage, completed_at, attempt_id")
      .eq("user_id", owner)
      .order("completed_at", { ascending: true })
      .order("attempt_id", { ascending: true });
    if (dashboardOwnerRef.current !== owner || dashboardGenerationRef.current !== generation) return;

    setQuizScores(scoresData ?? []);
    if (scoresData && scoresData.length > 0) {
      const avg = scoresData.reduce((sum, s) => sum + s.percentage, 0) / scoresData.length;
      setAvgQuizScore(Math.round(avg));
    }
  }, []);

  const exportProgress = async () => {
    if (!user || !dashboardReady) return;
    const owner = user.id;
    const generation = dashboardGenerationRef.current;
    try {
      const { data: exams, error } = await supabase
        .from("exam_results")
        .select("time_taken_seconds")
        .eq("user_id", owner);
      if (error) throw error;
      if (dashboardOwnerRef.current !== owner
        || dashboardGenerationRef.current !== generation
        || dashboardOwner !== owner) return;
      const report = buildProgressReportData({
        studentName: profile?.username || user.email || "Learner",
        generatedAt: new Date(),
        topics: getRootTopics(),
        progress: userProgress,
        quizScores,
        totalPoints: points,
        assessmentSeconds: (exams ?? []).reduce((sum, exam) => sum + exam.time_taken_seconds, 0),
      });
      await downloadProgressReport(report);
    } catch (error) {
      console.error("Error exporting progress:", error);
      toast.error("Could not create the progress report.");
    }
  };

  const fetchEngagement = React.useCallback(async () => {
    if (!user) return;
    const owner = user.id;
    setEngagementLoading(true);
    setEngagementError(false);
    setEngagementOwner(owner);
    try {
      const retryResults = await retryEngagementOutbox(supabase, owner);
      if (engagementOwnerRef.current !== owner) return;
      retryResults.flatMap(({ unlockedBadges }) => unlockedBadges)
        .forEach((badge) => toast.success(`${badge.icon} Badge unlocked: ${badge.name}`));
    } catch {
      if (engagementOwnerRef.current === owner) setEngagementError(true);
    }
    const [{ data: badgeRows, error: badgeError }, activityResult] = await Promise.all([
      supabase.from("user_badges").select("badge_id").eq("user_id", owner).order("earned_at", { ascending: false }),
      fetchAllStreakTimestamps(async (from, to) => {
        const { data, error } = await supabase.from("daily_activity")
          .select("first_activity_at")
          .eq("user_id", owner)
          .order("activity_date", { ascending: false })
          .range(from, to);
        if (error) throw error;
        return (data ?? []).map(({ first_activity_at }) => first_activity_at);
      }).then((timestamps) => ({ timestamps, error: null }))
        .catch((error: unknown) => ({ timestamps: [] as readonly string[], error })),
    ]);
    if (engagementOwnerRef.current !== owner) return;
    if (badgeError || activityResult.error) {
      setEngagementError(true);
      setEngagementLoading(false);
      return;
    }
    setEarnedBadges((badgeRows ?? [])
      .map(({ badge_id }) => badgeById.get(badge_id))
      .filter((badge): badge is BadgeDefinition => Boolean(badge)));
    setCurrentStreak(calculateStreak(activityResult.timestamps, new Date().toISOString()));
    setEngagementLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) {
      const owner = user.id;
      const generation = ++dashboardGenerationRef.current;
      setDashboardOwner(null);
      setDashboardLoading(true);
      setProfile(null);
      setPoints(0);
      setProgress(0);
      setTopicsCompleted(0);
      setAvgQuizScore(0);
      setQuizScores([]);
      setUserProgress({});
      void Promise.all([fetchProfile(owner, generation), fetchProgress(owner, generation)]).finally(() => {
        if (dashboardOwnerRef.current === owner && dashboardGenerationRef.current === generation) {
          setDashboardOwner(owner);
          setDashboardLoading(false);
        }
      });
      fetchEngagement();
    } else {
      dashboardGenerationRef.current += 1;
      setDashboardOwner(null);
      setDashboardLoading(false);
      setProfile(null);
      setPoints(0);
      setProgress(0);
      setTopicsCompleted(0);
      setAvgQuizScore(0);
      setQuizScores([]);
      setUserProgress({});
      setEarnedBadges([]);
      setCurrentStreak(0);
      setEngagementOwner(null);
      setEngagementLoading(false);
      setEngagementError(false);
    }
  }, [user, fetchProfile, fetchProgress, fetchEngagement]);

  const topicMenuModules: ModuleMenuItem[] = topics.map((topic) => ({
    id: topic.id,
    title: topic.title,
    description: topic.description,
    icon: topic.icon,
    path: topic.path,
    type: "learn",
    color: topic.menuColor,
    badgeLabel: "topic",
    buttonLabel: "Start Learning",
  }));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-ocean-light/10 to-background">
        <div className="text-center">
          <Ship className="w-12 h-12 mx-auto mb-4 text-primary animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-ocean-light/10 to-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary text-primary-foreground">
                <Ship className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">RYA Day Skipper</h1>
                <p className="text-sm text-muted-foreground">Seamanship & Preparation</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              {user ? (
                <>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-accent" />
                    <span className="font-bold text-lg">{visiblePoints}</span>
                    <span className="text-sm text-muted-foreground">points</span>
                  </div>
                  <Badge variant="secondary" className="gap-1">
                    <User className="w-3 h-3" />
                    {visibleProfile?.username || "Learner"}
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={signOut}>
                    <LogOut className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <Button onClick={() => navigate("/auth")} variant="secondary">
                  Sign In
                </Button>
              )}
              <Badge variant="secondary" className="gap-1">
                <BookOpen className="w-3 h-3" />
                Chapter 1
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {user && <div className="grid gap-4 md:grid-cols-2 mb-8">
          <Card className="border-2 border-orange-500/20"><CardContent className="pt-6 flex items-center gap-3">
            <Flame className="w-9 h-9 text-orange-500" />
            <div><h2 className="font-bold text-xl">{engagementOwner !== currentUserId || engagementLoading ? "Loading streak…" : `${currentStreak} day streak`}</h2>
              <p className="text-sm text-muted-foreground">Europe/Prague study days · +5 points for each maintained day</p></div>
          </CardContent></Card>
          <Card className="border-2 border-accent/20"><CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-3"><Award className="w-7 h-7 text-accent" />
              <h2 className="font-bold text-xl">Badges ({earnedBadges.length})</h2></div>
            <div className="flex flex-wrap gap-2">
              {engagementError ? <span role="alert" className="text-sm text-destructive">Engagement sync is pending; retry on your next visit.</span>
                : engagementOwner !== currentUserId || engagementLoading ? <span className="text-sm text-muted-foreground">Loading badges…</span>
                : earnedBadges.length === 0 ? <span className="text-sm text-muted-foreground">Complete learning milestones to earn badges.</span>
                : earnedBadges.map((badge) => <Badge key={badge.id} variant="secondary" title={badge.description}>
                  {badge.icon} {badge.name}
                </Badge>)}
            </div>
          </CardContent></Card>
        </div>}
        {user && <Card className="mb-8 border-2 border-secondary/20">
          <CardContent className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex gap-3"><Brain className="w-8 h-8 text-secondary" /><div>
              <h2 className="font-bold text-xl">{visibleDueReviews} {visibleDueReviews === 1 ? "question" : "questions"} due for review</h2>
              <p className="text-muted-foreground">Strengthen retention with today&apos;s spaced-repetition session.</p>
            </div></div>
            <Button onClick={() => navigate("/review")} disabled={visibleDueReviews === 0}>Start review</Button>
          </CardContent>
        </Card>}
        <Card className="mb-8 border-2 border-primary/20">
          <CardContent className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex gap-3">
              <ClipboardCheck className="w-8 h-8 text-primary" />
              <div><h2 className="font-bold text-xl">Ready for exam conditions?</h2>
                <p className="text-muted-foreground">Take a timed, weighted mock exam and track your results.</p></div>
            </div>
            <div className="flex gap-2"><Button onClick={() => navigate("/exam")}>Mock exam</Button>
              <Button variant="outline" onClick={() => navigate("/exam/history")}>History</Button></div>
          </CardContent>
        </Card>
        {/* Progress Overview */}
        <Card className="mb-8 border-2 border-secondary/20 bg-gradient-to-br from-card to-secondary/5">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-2xl">Your Learning Journey</CardTitle>
              {user && <Button variant="outline" className="min-h-11" onClick={exportProgress} disabled={!dashboardReady}>
                <FileDown aria-hidden="true" className="mr-2 h-4 w-4" />
                Export Progress Report
              </Button>}
            </div>
            <CardDescription>Complete all topics to master Seamanship & Preparation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Overall Progress</span>
                <span className="text-muted-foreground">{visibleProgress}%</span>
              </div>
              <Progress value={visibleProgress} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Topics Grid */}
        <ModuleMenuGrid
          modules={topicMenuModules}
          onNavigate={navigate}
          gridClassName="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          getCompletionState={(module) => {
            const topic = topics.find((item) => item.id === module.id);
            if (!topic) return { isCompleted: false };
            const { isCompleted, score } = deriveTopicCompletionState(topic, visibleUserProgress);
            return { isCompleted, score };
          }}
        />

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Card className="border-ocean/20 bg-ocean/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Topics Completed</p>
                  <p className="text-3xl font-bold text-ocean">
                    {visibleTopicsCompleted}/{topics.length}
                  </p>
                </div>
                <CheckCircle2 className="w-12 h-12 text-ocean/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-accent/20 bg-accent/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Quiz Score</p>
                  <p className="text-3xl font-bold text-accent">{visibleAvgQuizScore}%</p>
                </div>
                <Trophy className="w-12 h-12 text-accent/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-success/20 bg-success/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Points</p>
                  <p className="text-3xl font-bold text-success">{visiblePoints}</p>
                </div>
                <BookOpen className="w-12 h-12 text-success/30" />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;

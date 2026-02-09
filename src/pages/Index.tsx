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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthHooks";
import { supabase } from "@/integrations/supabase/client";
import { deriveTopicCompletionState } from "@/features/dashboard/topicCompletion";

interface Topic {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  path: string;
  color: string;
  completed: boolean;
  submoduleIds?: string[];
}

const topics: Topic[] = [
  {
    id: "nautical-terms",
    title: "Nautical Terms & Boat Parts",
    description: "Interactive boat diagram to learn parts and terminology",
    icon: Ship,
    path: "/nautical-terms",
    color: "text-ocean",
    completed: false,
    submoduleIds: ["nautical-terms-boat-parts", "nautical-terms-sail-controls", "nautical-terms-quiz"],
  },
  {
    id: "ropework",
    title: "Ropework & Knots",
    description: "Master essential knots with visual guides",
    icon: Link2,
    path: "/ropework",
    color: "text-rope",
    completed: false,
  },
  {
    id: "anchorwork",
    title: "Anchorwork",
    description: "Anchoring techniques and procedures",
    icon: Anchor,
    path: "/anchorwork",
    color: "text-primary",
    completed: false,
  },
  {
    id: "victualling",
    title: "Victualling (Provisioning)",
    description: "Planning and managing provisions for sea",
    icon: Fuel,
    path: "/victualling",
    color: "text-secondary",
    completed: false,
  },
  {
    id: "engine",
    title: "Engine Checks & Maintenance",
    description: "Essential engine maintenance procedures",
    icon: Wrench,
    path: "/engine",
    color: "text-accent",
    completed: false,
  },
  {
    id: "rig",
    title: "Rig Checks & Preparation",
    description: "Pre-sea rig inspection and preparation",
    icon: CheckCircle2,
    path: "/rig",
    color: "text-success",
    completed: false,
  },
  {
    id: "rules-of-the-road",
    title: "Rules of the Road",
    description: "Steering Rules (Part B) and Lights (Part C)",
    icon: Compass,
    path: "/rules-of-the-road",
    color: "text-red-500",
    completed: false,
    submoduleIds: ["colregs-theory", "lights-theory", "colregs"],
  },
  {
    id: "navigation",
    title: "Navigation Fundamentals",
    description: "Charts, Compass, and Position Fixing",
    icon: Map,
    path: "/navigation",
    color: "text-blue-500",
    completed: false,
    submoduleIds: ["charts-theory", "compass-theory", "position-theory"],
  },
  {
    id: "safety",
    title: "Safety Procedures",
    description: "Man Overboard, Distress Signals, and Emergency Drills",
    icon: LifeBuoy,
    path: "/safety",
    color: "text-red-500",
    completed: false,
    submoduleIds: ["safety-mob"],
  },
];

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
  const [userProgress, setUserProgress] = useState<Record<string, UserProgressData>>({});

  const fetchProfile = React.useCallback(async () => {
    if (!user) return;

    const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();

    if (data) {
      setProfile(data as UserProfile);
      setPoints(data.points || 0);
    }
  }, [user]);

  const fetchProgress = React.useCallback(async () => {
    if (!user) return;

    // Fetch user progress for all topics
    const { data: progressData } = await supabase.from("user_progress").select("*").eq("user_id", user.id);

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
    const { data: scoresData } = await supabase.from("quiz_scores").select("percentage").eq("user_id", user.id);

    if (scoresData && scoresData.length > 0) {
      const avg = scoresData.reduce((sum, s) => sum + s.percentage, 0) / scoresData.length;
      setAvgQuizScore(Math.round(avg));
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchProgress();
    }
  }, [user, fetchProfile, fetchProgress]);

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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary text-primary-foreground">
                <Ship className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">RYA Day Skipper</h1>
                <p className="text-sm text-muted-foreground">Seamanship & Preparation</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-accent" />
                    <span className="font-bold text-lg">{points}</span>
                    <span className="text-sm text-muted-foreground">points</span>
                  </div>
                  <Badge variant="secondary" className="gap-1">
                    <User className="w-3 h-3" />
                    {profile?.username || "Learner"}
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
        {/* Progress Overview */}
        <Card className="mb-8 border-2 border-secondary/20 bg-gradient-to-br from-card to-secondary/5">
          <CardHeader>
            <CardTitle className="text-2xl">Your Learning Journey</CardTitle>
            <CardDescription>Complete all topics to master Seamanship & Preparation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Overall Progress</span>
                <span className="text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Topics Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic) => {
            const Icon = topic.icon;
            const { isCompleted, score: topicScore } = deriveTopicCompletionState(topic, userProgress);

            return (
              <Card
                key={topic.id}
                className="group hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border-2 hover:border-secondary/50"
                onClick={() => navigate(topic.path)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className={`p-3 rounded-lg bg-muted ${topic.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    {isCompleted && (
                      <Badge variant="default" className="bg-success text-success-foreground">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        {topicScore}%
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg group-hover:text-secondary transition-colors">{topic.title}</CardTitle>
                  <CardDescription>{topic.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="secondary"
                    className="w-full group-hover:bg-secondary group-hover:text-secondary-foreground transition-all"
                  >
                    {isCompleted ? "Review" : "Start Learning"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Card className="border-ocean/20 bg-ocean/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Topics Completed</p>
                  <p className="text-3xl font-bold text-ocean">
                    {topicsCompleted}/{topics.length}
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
                  <p className="text-3xl font-bold text-accent">{avgQuizScore}%</p>
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
                  <p className="text-3xl font-bold text-success">{points}</p>
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

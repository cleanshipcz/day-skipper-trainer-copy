import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Trophy } from "lucide-react";
import { useProgress } from "@/hooks/useProgress";
import { cn } from "@/lib/utils";

interface CompletionBadgeProps {
  topicIds: string | string[];
  className?: string;
  showPercentage?: boolean;
}

export const CompletionBadge = ({ topicIds, className, showPercentage = true }: CompletionBadgeProps) => {
  const { loadProgress } = useProgress();
  const [percentage, setPercentage] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      const ids = Array.isArray(topicIds) ? topicIds : [topicIds];
      if (ids.length === 0) {
        setLoading(false);
        return;
      }

      try {
        let totalPercentage = 0;
        let completedCount = 0;

        for (const id of ids) {
          const data = await loadProgress(id);
          if (data) {
            // If the topic is marked as completed, count it as 100%
            // Otherwise use the score/percentage if available
            const itemScore = data.completed ? 100 : data.score || 0;
            totalPercentage += itemScore;
            if (data.completed) completedCount++;
          }
        }

        const avgPercentage = Math.round(totalPercentage / ids.length);
        setPercentage(avgPercentage);
        setIsCompleted(completedCount === ids.length);
      } catch (error) {
        console.error("Error fetching progress for badge:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [topicIds, loadProgress]);

  if (loading) {
    return (
      <Badge variant="secondary" className={cn("gap-1 animate-pulse", className)}>
        <Circle className="w-3 h-3" />
        Loading...
      </Badge>
    );
  }

  if (isCompleted) {
    return (
      <Badge variant="default" className={cn("bg-green-500 hover:bg-green-600 gap-1", className)}>
        <CheckCircle2 className="w-3 h-3" />
        Completed
      </Badge>
    );
  }

  if (percentage > 0) {
    return (
      <Badge variant="secondary" className={cn("gap-1", className)}>
        <Trophy className="w-3 h-3 text-yellow-500" />
        {percentage}%
      </Badge>
    );
  }

  return null;
};

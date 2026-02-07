import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Lightbulb, AlertTriangle, CheckCircle } from "lucide-react";

interface Feedback {
  type: "info" | "warning" | "success" | "error";
  message: string;
  details?: string;
}

interface SkipperMentorProps {
  feedback: Feedback | null;
}

const SkipperMentor = ({ feedback }: SkipperMentorProps) => {
  if (!feedback) return null;

  let Icon = Lightbulb;
  let colorClass = "border-blue-500 bg-blue-50 text-blue-900";

  if (feedback.type === "warning") {
    Icon = AlertTriangle;
    colorClass = "border-yellow-500 bg-yellow-50 text-yellow-900";
  } else if (feedback.type === "success") {
    Icon = CheckCircle;
    colorClass = "border-green-500 bg-green-50 text-green-900";
  } else if (feedback.type === "error") {
    Icon = AlertTriangle;
    colorClass = "border-red-500 bg-red-50 text-red-900";
  }

  return (
    <Alert
      className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 w-[90%] max-w-2xl shadow-xl border-l-4 animate-in slide-in-from-bottom-5 fade-in z-50 ${colorClass}`}
    >
      <Icon className="w-5 h-5" />
      <AlertTitle className="font-bold flex items-center justify-between">
        <span>Skipper's Log</span>
      </AlertTitle>
      <AlertDescription className="mt-1 text-sm font-medium opacity-90">
        {feedback.message}
        {feedback.details && (
          <p className="mt-2 text-xs opacity-80 border-t border-black/10 pt-2">{feedback.details}</p>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default SkipperMentor;

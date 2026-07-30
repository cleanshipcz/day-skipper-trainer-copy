import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchDueCount } from "./reviewService";

export const useDueReviewCount = (userId: string | null): number => {
  const [result, setResult] = useState<{ owner: string | null; generation: number; count: number }>(
    { owner: null, generation: -1, count: 0 },
  );
  const identityRef = useRef(userId);
  const generationRef = useRef(0);
  if (identityRef.current !== userId) {
    identityRef.current = userId;
    generationRef.current += 1;
  }

  useEffect(() => {
    if (!userId) return;
    const owner = userId;
    const generation = generationRef.current;
    void fetchDueCount(supabase, owner)
      .then((count) => {
        if (generation === generationRef.current && identityRef.current === owner) {
          setResult({ owner, generation, count });
        }
      })
      .catch(() => {
        if (generation === generationRef.current && identityRef.current === owner) {
          setResult({ owner, generation, count: 0 });
        }
      });
  }, [userId]);

  return result.owner === userId && result.generation === generationRef.current ? result.count : 0;
};

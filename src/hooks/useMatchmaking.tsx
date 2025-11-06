import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserFilters } from '@/components/InterestFilterModal';
import { toast } from 'sonner';

interface MatchResult {
  success: boolean;
  matched: boolean;
  session?: {
    id: string;
    user1_id: string;
    user2_id: string;
    status: string;
  };
  matchScore?: number;
  queuePosition?: number;
  message?: string;
}

export const useMatchmaking = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [userId] = useState(() => crypto.randomUUID());
  const [sessionId] = useState(() => crypto.randomUUID());

  const findMatch = async (filters: UserFilters) => {
    setIsSearching(true);
    setMatchResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('find-match', {
        body: {
          userId,
          sessionId,
          filters
        }
      });

      if (error) throw error;

      setMatchResult(data);

      if (data.matched) {
        toast.success(`Match found! Score: ${(data.matchScore * 100).toFixed(0)}%`);
      } else {
        toast.info(data.message || 'Searching for a match...');
      }

      return data;
    } catch (error) {
      console.error('Error finding match:', error);
      toast.error('Failed to find match');
      return null;
    } finally {
      setIsSearching(false);
    }
  };

  // Poll for matches every 5 seconds while searching
  useEffect(() => {
    if (!isSearching || matchResult?.matched) return;

    const interval = setInterval(async () => {
      // Check if we got matched by someone else
      const { data } = await (supabase as any)
        .from('matching_queue')
        .select('*, matched_with')
        .eq('user_id', userId)
        .eq('status', 'matched')
        .maybeSingle();

      if (data && data.matched_with) {
        // Get the session
        const { data: session } = await (supabase as any)
          .from('chat_sessions')
          .select('*')
          .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
          .eq('status', 'active')
          .maybeSingle();

        if (session) {
          setMatchResult({
            success: true,
            matched: true,
            session
          });
          toast.success('Match found!');
          setIsSearching(false);
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isSearching, matchResult, userId]);

  return {
    findMatch,
    isSearching,
    matchResult,
    userId,
    sessionId
  };
};

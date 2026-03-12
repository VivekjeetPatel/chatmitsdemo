-- Enable realtime for chat_messages table (skip if already added)
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;

-- Create WebRTC signaling table for peer connections
CREATE TABLE IF NOT EXISTS public.webrtc_signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  signal_type TEXT NOT NULL, -- 'offer', 'answer', 'ice-candidate'
  signal_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.webrtc_signals ENABLE ROW LEVEL SECURITY;

-- RLS policies for webrtc_signals
CREATE POLICY "Users can insert signals"
ON public.webrtc_signals
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can view their signals"
ON public.webrtc_signals
FOR SELECT
USING (true);

-- Enable realtime for webrtc_signals
ALTER TABLE public.webrtc_signals REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.webrtc_signals;
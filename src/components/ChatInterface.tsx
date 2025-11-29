import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Phone, Video, PhoneOff, Mic, MicOff, VideoIcon, VideoOff } from 'lucide-react';
import { useWebRTC } from '@/hooks/useWebRTC';
import { toast } from 'sonner';

interface ChatInterfaceProps {
  sessionId: string;
  userId: string;
  peerId: string;
  onSendMessage: (message: string) => void;
  onMediaUpload: () => void;
  onCallFunctionsReady?: (functions: { startVoiceCall: () => void; startVideoCall: () => void; endCall: () => void; localStream: MediaStream | null; remoteStream: MediaStream | null }) => void;
}

interface Message {
  id: string;
  sender_id: string;
  message: string;
  message_type: string;
  created_at: string;
}
export const ChatInterface = ({ 
  sessionId, 
  userId, 
  peerId,
  onSendMessage,
  onMediaUpload,
  onCallFunctionsReady
}: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const {
    localStream,
    remoteStream,
    isCallActive,
    isVideoEnabled,
    isAudioEnabled,
    startVoiceCall,
    startVideoCall,
    toggleAudio,
    toggleVideo,
    endCall
  } = useWebRTC({
    sessionId,
    userId,
    peerId,
    onRemoteStream: (stream) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    }
  });

  // Expose call functions to parent component
  useEffect(() => {
    if (onCallFunctionsReady && startVoiceCall && startVideoCall && endCall !== undefined) {
      onCallFunctionsReady({
        startVoiceCall,
        startVideoCall,
        endCall,
        localStream,
        remoteStream,
      });
    }
  }, [onCallFunctionsReady, startVoiceCall, startVideoCall, endCall, localStream, remoteStream]);

  // Load existing messages
  useEffect(() => {
    const loadMessages = async () => {
      const { data, error } = await (supabase as any)
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error);
      } else {
        setMessages(data || []);
      }
    };

    loadMessages();
  }, [sessionId]);

  // Subscribe to new messages
  useEffect(() => {
    console.log('Setting up real-time subscription for session:', sessionId);
    
    const channel = supabase
      .channel(`chat-messages-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `session_id=eq.${sessionId}`
        },
        (payload: any) => {
          console.log('New message received via real-time:', payload.new);
          setMessages(prev => [...prev, payload.new]);
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      console.log('Cleaning up subscription for session:', sessionId);
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Update video refs
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div className="flex flex-col h-full">
      

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_id === userId ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  msg.sender_id === userId
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm">{msg.message}</p>
                {/* <span className="text-xs opacity-70">
                  {new Date(msg.created_at).toLocaleTimeString()}
                </span> */}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

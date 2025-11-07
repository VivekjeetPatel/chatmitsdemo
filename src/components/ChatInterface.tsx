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
  onMediaUpload 
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
    const channel = supabase
      .channel('chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `session_id=eq.${sessionId}`
        },
        (payload: any) => {
          setMessages(prev => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
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
      {/* Call Controls */}
      <div className="flex gap-2 p-4 bg-background/95 border-b border-border">
        {!isCallActive ? (
          <>
            <Button
              onClick={startVoiceCall}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Phone className="h-4 w-4" />
              Voice Call
            </Button>
            <Button
              onClick={startVideoCall}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Video className="h-4 w-4" />
              Video Call
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={toggleAudio}
              variant={isAudioEnabled ? "outline" : "destructive"}
              size="sm"
              className="gap-2"
            >
              {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            </Button>
            {isVideoEnabled && (
              <Button
                onClick={toggleVideo}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                {isVideoEnabled ? <VideoIcon className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
              </Button>
            )}
            <Button
              onClick={endCall}
              variant="destructive"
              size="sm"
              className="gap-2"
            >
              <PhoneOff className="h-4 w-4" />
              End Call
            </Button>
          </>
        )}
      </div>

      {/* Video Display */}
      {isCallActive && (
        <div className="relative bg-black">
          {remoteStream && (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-64 object-cover"
            />
          )}
          {localStream && (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="absolute bottom-4 right-4 w-32 h-24 object-cover rounded-lg border-2 border-primary"
            />
          )}
        </div>
      )}

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
                <span className="text-xs opacity-70">
                  {new Date(msg.created_at).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

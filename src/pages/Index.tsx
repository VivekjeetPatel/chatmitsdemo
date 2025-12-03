import { useState, useEffect, useRef } from "react";
import { Menu, MoreVertical, Phone, Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatInput } from "@/components/ChatInput";
import { SettingsPanel } from "@/components/SettingsPanel";
import { FeedbackModal } from "@/components/FeedbackModal";
import { InterestFilterModal, UserFilters } from "@/components/InterestFilterModal";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ChatInterface } from "@/components/ChatInterface";
import { useMatchmaking } from "@/hooks/useMatchmaking";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { VoiceVisualizer } from "@/components/VoiceVisualizer";

interface MainContentProps {
  filters: UserFilters;
  setFilters: (filters: UserFilters) => void;
  findMatch: (filters: UserFilters) => Promise<void>;
  isSearching: boolean;
  matchResult: any;
  userId: string;
}

const MainContent = ({ filters, setFilters, findMatch, isSearching, matchResult, userId }: MainContentProps) => {
  const { open: sidebarOpen } = useSidebar();
  const isMobile = useIsMobile();
  const [callWindow, setCallWindow] = useState<{ type: "voice" | "video"; active: boolean } | null>(null);
  const [callWindowPos, setCallWindowPos] = useState({ x: 60, y: 130 });
  const [isDraggingCallWin, setIsDraggingCallWin] = useState(false);
  const dragOffsetRef = useRef<{x:number, y:number}>({x:0,y:0});
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [callControls, setCallControls] = useState<{
    startVoiceCall: () => void;
    startVideoCall: () => void;
    endCall: () => void;
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
  } | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [callFunctions, setCallFunctions] = useState<{ startVoiceCall: () => void; startVideoCall: () => void } | null>(null);
  const [settings, setSettings] = useState({
    aiMode: false,
    voiceCall: true,
    videoCall: true,
  });
  const [callWindowSize, setCallWindowSize] = useState({ width: 288, height: 245 });
  const [isResizingCallWin, setIsResizingCallWin] = useState(false);
  const resizeOffsetRef = useRef<{x:number,y:number,w:number,h:number}>({x:0, y:0, w:288, h:245});
  const ringtoneRef = useRef<HTMLAudioElement|null>(null);

  // Drag logic for call window
  const startDragCallWin = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDraggingCallWin(true);
    dragOffsetRef.current = {
      x: e.clientX - callWindowPos.x,
      y: e.clientY - callWindowPos.y,
    };
  };
  useEffect(() => {
    if (!isDraggingCallWin) return;
    function onMove(e: MouseEvent) {
      setCallWindowPos(pos => ({
        x: Math.max(0, e.clientX - dragOffsetRef.current.x),
        y: Math.max(0, e.clientY - dragOffsetRef.current.y),
      }));
    }
    function onUp() { setIsDraggingCallWin(false); }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isDraggingCallWin]);

  // Resize logic
  const startResizeCallWin = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsResizingCallWin(true);
    resizeOffsetRef.current = {
      x: e.clientX,
      y: e.clientY,
      w: callWindowSize.width,
      h: callWindowSize.height
    };
  };
  useEffect(() => {
    if (!isResizingCallWin) return;
    function onMove(e: MouseEvent) {
      setCallWindowSize(s => ({
        width: Math.max(260, Math.min(480, resizeOffsetRef.current.w + (e.clientX - resizeOffsetRef.current.x))),
        height: Math.max(200, Math.min(420, resizeOffsetRef.current.h + (e.clientY - resizeOffsetRef.current.y))),
      }));
    }
    function onUp() { setIsResizingCallWin(false); }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isResizingCallWin]);

  // Ringtone: play when starting call, stop on end
  useEffect(() => {
    if (!callWindow || !ringtoneRef.current) return;
    if (callWindow.active) {
      ringtoneRef.current.currentTime = 0;
      ringtoneRef.current.loop = true;
      ringtoneRef.current.play().catch(()=>{});
    } else {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
    }
    return () => {
      if(ringtoneRef.current) {ringtoneRef.current.pause(); ringtoneRef.current.currentTime = 0;}
    };
  }, [callWindow?.type, callWindow?.active]);

  // Handle call end
  const onEndCall = () => {
    callControls?.endCall && callControls.endCall();
    setCallWindow(null);
  };

  // Header button click handlers
  const handleVoiceCallClick = () => {
    if (callWindow?.type === "voice" && callWindow.active) {
      onEndCall();
      return;
    }
    callControls?.startVoiceCall && callControls.startVoiceCall();
    setCallWindow({ type: "voice", active: true });
  };
  const handleVideoCallClick = () => {
    if (callWindow?.type === "video" && callWindow.active) {
      onEndCall();
      return;
    }
    callControls?.startVideoCall && callControls.startVideoCall();
    setCallWindow({ type: "video", active: true });
  };

  // Auto-close call window when call ends (TODO: tie to call active/stream state)
  useEffect(() => {
    if (callWindow?.active && callControls?.localStream) {
      const cleanup = () => {
        setCallWindow(null);
        setCallControls(null);
      };
      const stream = callControls.localStream;
      stream.getTracks().forEach(track => track.stop());
      window.removeEventListener("beforeunload", cleanup);
      window.addEventListener("beforeunload", cleanup);
      return () => {
        window.removeEventListener("beforeunload", cleanup);
      };
    }
  }, [callWindow?.active, callControls?.localStream]);

  const handleSendMessage = async (message: string) => {
    if (!matchResult?.session) {
      toast.error("No active chat session");
      return;
    }

    try {
      console.log('Sending message:', {
        session_id: matchResult.session.id,
        sender_id: userId,
        message: message
      });

      const { data, error } = await (supabase as any)
        .from('chat_messages')
        .insert({
          session_id: matchResult.session.id,
          sender_id: userId,
          message: message,
          message_type: 'text'
        })
        .select();

      if (error) throw error;
      
      console.log('Message sent successfully:', data);
      // toast.success('Message sent!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast.success(`${key} ${value ? 'enabled' : 'disabled'}`);
  };

  const handleVoiceInput = () => {
    toast.info("Voice input activated");
  };

  const handleMediaUpload = () => {
    toast.info("Media upload clicked");
  };

  const handleShowTips = () => {
    toast.info("Tips feature coming soon!");
    setIsSettingsOpen(false);
  };

  const handleClearCache = () => {
    toast.success("Cache cleared!");
    setIsSettingsOpen(false);
  };

  const handleApplyFilters = async (newFilters: UserFilters) => {
    setFilters(newFilters);
    const totalSelected = Object.values(newFilters).flat().length;
    toast.success(`${totalSelected} filter${totalSelected !== 1 ? 's' : ''} applied!`);
    
    // Start matching process
    if (totalSelected > 0) {
      await findMatch(newFilters);
    }
  };
  const handleCallFunctionsReady = (fns: any) => {
    setCallFunctions(fns); // still needed for original buttons
    setCallControls(fns);
  };

  
  return (
    <>
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-9 bg-background/98 backdrop-blur-sm border-b border-border">
          <div className="h-16 flex items-center justify-between px-6">
            <div className="flex items-center justify-start w-12">
              {(isMobile || !sidebarOpen) && (
                <SidebarTrigger className="text-foreground/70 hover:text-primary hover:bg-transparent" />
              )}
            </div>
            
            <h1 className="text-xl font-semibold text-primary absolute left-1/2 transform -translate-x-1/2">ChatMITS</h1>
            
            <div className="flex items-center gap-2">
              {matchResult?.matched && matchResult.session && (<> 
              {/* Floating call buttons */}
              <Button
                onClick={handleVoiceCallClick}
                variant={callWindow?.active && callWindow.type === "voice" ? "destructive" : "outline"}
                size="sm"
                className="gap-2"
                disabled={!settings.voiceCall}
              >
                {callWindow?.active && callWindow.type === "voice" ? "End Call" : "Voice Call"}
              </Button>
              <Button
                onClick={handleVideoCallClick}
                variant={callWindow?.active && callWindow.type === "video" ? "destructive" : "outline"}
                size="sm"
                className="gap-2"
                disabled={!settings.videoCall}
              >
                {callWindow?.active && callWindow.type === "video" ? "End Call" : "Video Call"}
              </Button>
              </>)}
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground/70 hover:text-primary hover:bg-transparent w-12"
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              >
                {isSettingsOpen ? <X className="h-5 w-5" /> : <MoreVertical className="h-5 w-5" />}
              </Button>
              
            </div>
          </div>
        </header>

          {/* Settings Panel */}
          <SettingsPanel
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            settings={settings}
            onSettingChange={handleSettingChange}
            onShowTips={handleShowTips}
            onClearCache={handleClearCache}
            onShowFeedback={() => {
              setIsFeedbackOpen(true);
              setIsSettingsOpen(false);
            }}
          />

          {/* Feedback Modal */}
          <FeedbackModal
            isOpen={isFeedbackOpen}
            onClose={() => setIsFeedbackOpen(false)}
          />

          {/* Interest Filter Modal */}
          <InterestFilterModal
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            onApplyFilters={handleApplyFilters}
            currentFilters={filters}
          />

          {/* Main Content */}
          <main ref={chatContainerRef} className="flex-1 flex flex-col items-center justify-center px-6 overflow-y-auto relative">
            {/* Floating Call Window */}
            {callWindow && (
              <div
                className="absolute z-50 rounded-2xl bg-background border border-primary/30 shadow-2xl cursor-move select-none"
                style={{ top: callWindowPos.y, left: callWindowPos.x, width: callWindowSize.width, height: callWindowSize.height }}
                onMouseDown={startDragCallWin}
              >
                <div className="p-4 h-full">
                  {callWindow.type === "video" ? (
                    <video autoPlay playsInline className="w-full h-40 rounded-xl bg-black" style={{height: callWindowSize.height-86}} ref={el => { if (el && callControls?.remoteStream) el.srcObject = callControls.remoteStream; }} />
                  ) : (
                    <VoiceVisualizer stream={callControls?.localStream ?? null} />
                  )}
                {/* <div className="flex items-center justify-between px-4 py-2  border-border">
                  <span className="text-sm font-semibold capitalize">{callWindow.type} call</span>
                  <Button size="sm" variant="destructive" onClick={onEndCall}>End Call</Button>
                </div> */}
                </div>

                {/* Resize handle */}
                <div
                  className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize select-none z-10"
                  onMouseDown={startResizeCallWin}
                  style={{borderBottom: '2px solid #ff6200', borderRight: '2px solid #ff6200', borderBottomRightRadius: 8}}
                />
              </div>
            )}
            <audio ref={ringtoneRef} src="/ringtone.mp3" preload="auto" style={{display:'none'}} />
            {matchResult?.matched && matchResult.session ? (
              // Chat Interface when matched
              <div className="w-full max-w-4xl h-full max-h-[calc(100vh-8rem)] bg-card rounded-3xl shadow-soft border border-border flex flex-col my-6">
                <div className="flex-1 overflow-hidden">
                <ChatInterface
                    sessionId={matchResult.session.id}
                    userId={userId}
                    peerId={matchResult.session.user1_id === userId ? matchResult.session.user2_id : matchResult.session.user1_id}
                    onSendMessage={handleSendMessage}
                    onMediaUpload={handleMediaUpload}
                    onCallFunctionsReady={handleCallFunctionsReady}
                  />
                  
                </div>
                <div className="p-6 border-t border-border">
                  <ChatInput
                     onSendMessage={handleSendMessage}
                     onVoiceInput={handleVoiceInput}
                     onMediaUpload={handleMediaUpload}
                     placeholder="Say something nicer..."
                     disabled={!matchResult?.matched}
                     disabledMessage="Please select filters first, then select New Chat to start typing messages."
                  />
                </div>
              </div>
            ) : (
              // Landing page when not matched
              <div className="w-full max-w-2xl space-y-8 my-auto">
                <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <h2 className="text-3xl md:text-4xl font-semibold text-foreground leading-tight">
                    Genuine Chat Instantly.<br />
                  </h2>
                </div>

                {/* User Indicator & Chat Input */}
                <div className="w-full space-y-1 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
                  <div className="text-left">
                      {matchResult?.queuePosition && (
                        <p className="text-sm text-muted-foreground">
                          Queue position: {matchResult.queuePosition}
                        </p>
                      )}
                    <p className="text-lg pl-8  font-medium text-primary">
                      {isSearching ? "Searching for match..." : 
                       "anonymous user"}
                    </p>
                  </div>
                  
                  {/* Chat Input */}
                  <ChatInput
                    onSendMessage={handleSendMessage}
                    onVoiceInput={handleVoiceInput}
                    onMediaUpload={handleMediaUpload}
                    placeholder="Say something nicer..."
                    disabled={!matchResult?.matched}
                  />
                  
                  {/* Single line description text */}
                  <p className="text-center text-sm text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">
                    Filters connect you with the right people.
                  </p>
                </div>
              </div>
            )}
          </main>
        </div>
      </>
  );
};

const Index = () => {
  const [filters, setFilters] = useState<UserFilters>({
    gender: [],
    mood: [],
    topics: [],
    hobbies: [],
    interests: [],
    profession: []
  });

  const { findMatch, isSearching, matchResult, userId } = useMatchmaking();

  const handleNewChat = async () => {
    if (Object.values(filters).flat().length === 0) {
      toast.error("Please set your interest filters first");
      return;
    }
    
    toast.info("Searching for a match...");
    await findMatch(filters);
  };

  return (
    <SidebarProvider>
      <div className="h-screen w-full bg-background flex overflow-hidden">
        <AppSidebar 
          onNewChat={handleNewChat}
          onOpenFilters={() => {}}
          isTimeWindowActive={true}
          filters={filters}
          onFiltersChange={setFilters}
        />
        <MainContent 
          filters={filters}
          setFilters={setFilters}
          findMatch={findMatch}
          isSearching={isSearching}
          matchResult={matchResult}
          userId={userId}
        />
      </div>
    </SidebarProvider>
  );
};

export default Index;

import { useState, useRef, useEffect } from "react";
import { MoreVertical, X } from "lucide-react";
import { Button } from "react-bootstrap";
import { ChatInput } from "../components/ChatInput";
import { SettingsPanel } from "../components/SettingsPanel";
import { FeedbackModal } from "../components/FeedbackModal";
import { InterestFilterModal, UserFilters } from "../components/InterestFilterModal";
import { AppSidebar } from "../components/AppSidebar";
import { ChatInterface } from "../components/ChatInterface";
import { useMatchmaking } from "../hooks/useMatchmaking";
import { useIsMobile } from "../hooks/use-mobile";
import { VoiceVisualizer } from "../components/VoiceVisualizer";

interface MainContentProps {
  filters: UserFilters;
  setFilters: (filters: UserFilters) => void;
  findMatch: (filters: UserFilters) => Promise<any>;
  isSearching: boolean;
  matchResult: any;
  userId: string;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  stompClient: any;
}

const MainContent = ({ filters, setFilters, findMatch, isSearching, matchResult, userId, sidebarOpen, setSidebarOpen, stompClient }: MainContentProps) => {
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
      setCallWindowPos({
        x: Math.max(0, e.clientX - dragOffsetRef.current.x),
        y: Math.max(0, e.clientY - dragOffsetRef.current.y),
      });
    }
    function onUp() { setIsDraggingCallWin(false); }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isDraggingCallWin]);

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
      setCallWindowSize({
        width: Math.max(260, Math.min(480, resizeOffsetRef.current.w + (e.clientX - resizeOffsetRef.current.x))),
        height: Math.max(200, Math.min(420, resizeOffsetRef.current.h + (e.clientY - resizeOffsetRef.current.y))),
      });
    }
    function onUp() { setIsResizingCallWin(false); }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isResizingCallWin]);

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

  const onEndCall = () => {
    callControls?.endCall && callControls.endCall();
    setCallWindow(null);
  };

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
      alert("No active chat session");
      return;
    }
    if (!stompClient.current || !stompClient.current.connected) {
      console.error("STOMP client not connected");
      return;
    }

    try {
      const chatMessage = {
        sessionId: matchResult.session.id,
        senderId: userId,
        message: message,
        messageType: "TEXT"
      };
      
      stompClient.current.publish({
        destination: "/app/chat.sendMessage",
        body: JSON.stringify(chatMessage)
      });
      console.log('Sending message:', message);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
  };

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleVoiceInput = () => {
    alert("Voice input activated");
  };

  const handleMediaUpload = (base64Media: string) => {
    if (!matchResult?.session || !stompClient.current || !stompClient.current.connected) return;
    try {
      const chatMessage = {
        sessionId: matchResult.session.id,
        senderId: userId,
        message: base64Media,
        messageType: "IMAGE"
      };
      
      stompClient.current.publish({
        destination: "/app/chat.sendMessage",
        body: JSON.stringify(chatMessage)
      });
    } catch (error) {
      console.error('Error sending media:', error);
    }
  };

  const handleShowTips = () => {
    alert("Tips feature coming soon!");
    setIsSettingsOpen(false);
  };

  const handleClearCache = () => {
    alert("Cache cleared!");
    setIsSettingsOpen(false);
  };

  const handleApplyFilters = async (newFilters: UserFilters) => {
    setFilters(newFilters);
    const totalSelected = Object.values(newFilters).flat().length;
    alert(`${totalSelected} filter${totalSelected !== 1 ? 's' : ''} applied!`);
    
    if (totalSelected > 0) {
      await findMatch(newFilters);
    }
  };

  const handleCallFunctionsReady = (fns: any) => {
    setCallFunctions(fns);
    setCallControls(fns);
  };

  return (
    <>
      <div className="flex-grow-1 d-flex flex-column vh-100 overflow-hidden bg-white">
        {/* Header */}
        <header className="sticky-top bg-white border-bottom shadow-sm z-3">
          <div className="d-flex align-items-center justify-content-between px-4" style={{ height: '64px' }}>
            <div className="d-flex align-items-center" style={{ width: '48px' }}>
              {(isMobile || !sidebarOpen) && (
                <Button variant="link" className="text-dark p-0" onClick={() => setSidebarOpen(!sidebarOpen)}>
                  <MoreVertical size={24} />
                </Button>
              )}
            </div>
            
            <h1 className="h5 fw-bold mb-0 position-absolute start-50 translate-middle-x" style={{ color: '#FF6200' }}>ChatMITS</h1>
            
            <div className="d-flex align-items-center gap-2">
              {matchResult?.matched && matchResult.session && (<> 
                <Button
                  onClick={handleVoiceCallClick}
                  variant={callWindow?.active && callWindow.type === "voice" ? "danger" : "outline-secondary"}
                  size="sm"
                  disabled={!settings.voiceCall}
                >
                  {callWindow?.active && callWindow.type === "voice" ? "End Call" : "Voice Call"}
                </Button>
                <Button
                  onClick={handleVideoCallClick}
                  variant={callWindow?.active && callWindow.type === "video" ? "danger" : "outline-secondary"}
                  size="sm"
                  disabled={!settings.videoCall}
                >
                  {callWindow?.active && callWindow.type === "video" ? "End Call" : "Video Call"}
                </Button>
              </>)}
              <Button
                variant="light"
                className="rounded-circle p-2"
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              >
                {isSettingsOpen ? <X size={20} /> : <MoreVertical size={20} />}
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
        <main ref={chatContainerRef} className="flex-grow-1 d-flex flex-column position-relative overflow-y-auto px-4 py-3 align-items-center justify-content-center">
          {/* Floating Call Window */}
          {callWindow && (
            <div
              className="position-absolute z-3 rounded-4 bg-white border shadow-lg"
              style={{ top: callWindowPos.y, left: callWindowPos.x, width: callWindowSize.width, height: callWindowSize.height, cursor: 'move', userSelect: 'none' }}
              onMouseDown={startDragCallWin}
            >
              <div className="p-3 h-100">
                {callWindow.type === "video" ? (
                  <video autoPlay playsInline className="w-100 rounded-3 bg-dark" style={{ height: callWindowSize.height - 50, objectFit: 'cover' }} ref={el => { if (el && callControls?.remoteStream) el.srcObject = callControls.remoteStream; }} />
                ) : (
                  <VoiceVisualizer stream={callControls?.localStream ?? null} />
                )}
              </div>

              {/* Resize handle */}
              <div
                className="position-absolute bottom-0 end-0"
                onMouseDown={startResizeCallWin}
                style={{
                  width: '20px', height: '20px', cursor: 'nwse-resize', zIndex: 10,
                  borderBottom: '3px solid #FF6200', borderRight: '3px solid #FF6200', borderBottomRightRadius: '12px'
                }}
              />
            </div>
          )}
          
          <audio ref={ringtoneRef} src="/ringtone.mp3" preload="auto" style={{display:'none'}} />
          
          {matchResult?.matched && matchResult.session ? (
            <div className="w-100 max-w-4xl d-flex flex-column h-100 bg-light rounded-4 border shadow-sm my-3" style={{ maxHeight: 'calc(100vh - 120px)', maxWidth: '900px' }}>
              <div className="flex-grow-1 overflow-hidden">
                <ChatInterface
                  sessionId={matchResult.session.id}
                  userId={userId}
                  peerId={matchResult.session.user1Id === userId ? matchResult.session.user2Id : matchResult.session.user1Id}
                  onSendMessage={handleSendMessage}
                  onMediaUpload={handleMediaUpload as unknown as () => void} // We will update ChatInterface props next
                  onCallFunctionsReady={handleCallFunctionsReady}
                  stompClient={stompClient}
                />
              </div>
              <div className="p-4 border-top bg-white rounded-bottom-4">
                <ChatInput
                   onSendMessage={handleSendMessage}
                   onVoiceInput={handleVoiceInput}
                   onMediaUpload={handleMediaUpload}
                   placeholder="Say something nicer..."
                   disabled={!matchResult?.matched}
                />
              </div>
            </div>
          ) : (
            <div className="w-100 max-w-2xl text-center my-auto" style={{ maxWidth: '600px' }}>
              <h2 className="display-6 fw-bold text-dark mb-5">
                Genuine Chat Instantly.<br />
              </h2>

              <div className="text-start mb-3">
                {matchResult?.queuePosition && (
                  <p className="text-secondary small mb-1">Queue position: {matchResult.queuePosition}</p>
                )}
                <p className="fs-5 fw-medium ps-2" style={{ color: '#FF6200' }}>
                  {isSearching ? "Searching for match..." : "anonymous user"}
                </p>
              </div>
              
              <div className="mb-4">
                <ChatInput
                  onSendMessage={handleSendMessage}
                  onVoiceInput={handleVoiceInput}
                  onMediaUpload={handleMediaUpload}
                  placeholder="Say something nicer..."
                  disabled={!matchResult?.matched}
                />
              </div>
              
              <p className="text-secondary small">
                Filters connect you with the right people.
              </p>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filters, setFilters] = useState<UserFilters>({
    gender: [],
    mood: [],
    topics: [],
    hobbies: [],
    interests: [],
    profession: []
  });

  const { findMatch, isSearching, matchResult, userId, stompClient } = useMatchmaking();

  const handleNewChat = async () => {
    if (Object.values(filters).flat().length === 0) {
      alert("Please set your interest filters first");
      return;
    }
    
    // alert("Searching for a match...");
    await findMatch(filters);
  };

  const isMobile = useIsMobile();

  return (
    <div className="d-flex vh-100 vw-100 overflow-hidden bg-light position-relative">
      {(sidebarOpen || !isMobile) && (
        <div 
          className={`h-100 flex-shrink-0 ${isMobile ? 'position-absolute top-0 start-0 w-100 shadow-lg' : ''}`} 
          style={{ zIndex: 1050 }}
        >
           <AppSidebar 
            onNewChat={handleNewChat}
            onOpenFilters={() => {}}
            isTimeWindowActive={true}
            filters={filters}
            onFiltersChange={setFilters}
            onClose={isMobile ? () => setSidebarOpen(false) : undefined}
          />
        </div>
      )}
      <MainContent 
        filters={filters}
        setFilters={setFilters}
        findMatch={findMatch}
        isSearching={isSearching}
        matchResult={matchResult}
        userId={userId}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        stompClient={stompClient}
      />
    </div>
  );
};

export default Index;

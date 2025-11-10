import { useState, useEffect } from "react";
import { Menu, MoreVertical, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatInput } from "@/components/ChatInput";
import { SettingsPanel } from "@/components/SettingsPanel";
import { FeedbackModal } from "@/components/FeedbackModal";
import { InterestFilterModal, UserFilters } from "@/components/InterestFilterModal";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ChatInterface } from "@/components/ChatInterface";
import { useMatchmaking } from "@/hooks/useMatchmaking";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [settings, setSettings] = useState({
    aiMode: false,
    voiceCall: false,
    videoCall: false,
  });
  const [filters, setFilters] = useState<UserFilters>({
    gender: [],
    topics: [],
    hobbies: [],
    interests: [],
    profession: []
  });

  const { findMatch, isSearching, matchResult, userId, sessionId } = useMatchmaking();

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
      toast.success('Message sent!');
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

  const handleNewChat = async () => {
    if (Object.values(filters).flat().length === 0) {
      toast.error("Please set your interest filters first");
      setIsFilterOpen(true);
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
          onOpenFilters={() => setIsFilterOpen(true)}
          isTimeWindowActive={true}
          filters={filters}
          onFiltersChange={setFilters}
        />
        
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Header */}
          <header className="sticky top-0 z-30 bg-background/98 backdrop-blur-sm border-b border-border">
            <div className="h-16 flex items-center justify-between px-6">
              <div className="flex items-center justify-start w-12">
                <SidebarTrigger className="text-foreground/70 hover:text-primary hover:bg-transparent" />
              </div>
              
              <h1 className="text-xl font-semibold text-foreground absolute left-1/2 transform -translate-x-1/2">ChatMITS</h1>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-foreground/70 hover:text-primary hover:bg-transparent w-12"
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              >
                {isSettingsOpen ? <X className="h-5 w-5" /> : <MoreVertical className="h-5 w-5" />}
              </Button>
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
          <main className="flex-1 flex flex-col items-center justify-center px-6 overflow-y-auto">
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
                  />
                </div>
                <div className="p-6 border-t border-border">
                  <ChatInput
                    onSendMessage={handleSendMessage}
                    onVoiceInput={handleVoiceInput}
                    onMediaUpload={handleMediaUpload}
                    placeholder="Say something nice..."
                    disabled={false}
                  />
                </div>
              </div>
            ) : (
              // Landing page when not matched
              <div className="w-full max-w-2xl space-y-8 my-auto">
                <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <h2 className="text-3xl md:text-4xl font-semibold text-foreground leading-tight">
                    Stay Anonymous. Connect Instantly.<br />Chat Freely.
                  </h2>
                </div>

                {/* User Indicator & Chat Input */}
                <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
                  <div className="text-left">
                    <p className="text-lg font-medium text-primary">
                      {isSearching ? "Searching for match..." : 
                       "random anonymous user"}
                    </p>
                    {matchResult?.queuePosition && (
                      <p className="text-sm text-muted-foreground">
                        Queue position: {matchResult.queuePosition}
                      </p>
                    )}
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
                    Filters connect you with the right people, and smart tips make chats fun & safe.
                  </p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;

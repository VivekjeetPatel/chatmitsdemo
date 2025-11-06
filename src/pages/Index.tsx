import { useState } from "react";
import { Menu, MoreVertical, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatInput } from "@/components/ChatInput";
import { SettingsPanel } from "@/components/SettingsPanel";
import { FeedbackModal } from "@/components/FeedbackModal";
import { InterestFilterModal, UserFilters } from "@/components/InterestFilterModal";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { toast } from "sonner";

const Index = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isTimeWindowActive] = useState(true); // Always true during development
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

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast.success(`${key} ${value ? 'enabled' : 'disabled'}`);
  };

  const handleSendMessage = (message: string) => {
    console.log("Message:", message);
    toast.success("Message sent!");
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

  const handleApplyFilters = (newFilters: UserFilters) => {
    setFilters(newFilters);
    const totalSelected = Object.values(newFilters).flat().length;
    toast.success(`${totalSelected} filter${totalSelected !== 1 ? 's' : ''} applied!`);
  };

  const handleNewChat = () => {
    toast.info("Starting new chat...");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-gradient-to-b from-background to-primary-light/20 flex">
        <AppSidebar 
          onNewChat={handleNewChat}
          onOpenFilters={() => setIsFilterOpen(true)}
          isTimeWindowActive={isTimeWindowActive}
        />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b-4 border-primary shadow-soft">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SidebarTrigger />
                <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10 md:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </div>
              
              <h1 className="text-2xl font-bold text-primary">ChatMITS</h1>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-primary hover:bg-primary/10"
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              >
                {isSettingsOpen ? <X className="h-6 w-6" /> : <MoreVertical className="h-6 w-6" />}
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
          <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 space-y-8">
            <div className="text-center space-y-6 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h2 className="text-3xl md:text-4xl font-bold text-primary leading-tight">
                Stay Anonymous. Connect Instantly.<br />Chat Freely.
              </h2>
            </div>

            {/* User Indicator & Chat Input */}
            <div className="w-full max-w-2xl space-y-3 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
              <div className="text-left">
                <p className="text-xl font-bold text-primary">random anonymous user</p>
              </div>
              
              {/* Chat Input */}
              <ChatInput
                onSendMessage={handleSendMessage}
                onVoiceInput={handleVoiceInput}
                onMediaUpload={handleMediaUpload}
                placeholder={isTimeWindowActive ? "Say something nicer..." : "ChatMITS is offline"}
                disabled={!isTimeWindowActive}
              />
              
              {/* Moved description text */}
              <p className="text-center text-base md:text-lg text-foreground/70 leading-relaxed pt-2">
                Filters connect you with the right people,<br />
                and smart tips make chats fun & safe.
              </p>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;

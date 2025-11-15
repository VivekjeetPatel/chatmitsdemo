import { Phone, Video, Lightbulb, RotateCcw, MessageSquare, Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

const DarkModeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-primary">Theme</label>
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={theme === "light" ? "default" : "outline"}
            size="sm"
            className="rounded-full px-6"
            onClick={() => setTheme("light")}
          >
            <Sun className="h-4 w-4 mr-2" />
            Light
          </Button>
          <Button
            variant={theme === "dark" ? "default" : "outline"}
            size="sm"
            className="rounded-full px-6"
            onClick={() => setTheme("dark")}
          >
            <Moon className="h-4 w-4 mr-2" />
            Dark
          </Button>
        </div>
      </div>
    </div>
  );
};

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    aiMode: boolean;
    voiceCall: boolean;
    videoCall: boolean;
  };
  onSettingChange: (key: string, value: boolean) => void;
  onShowTips: () => void;
  onClearCache: () => void;
  onShowFeedback: () => void;
}

export const SettingsPanel = ({
  isOpen,
  onClose,
  settings,
  onSettingChange,
  onShowTips,
  onClearCache,
  onShowFeedback,
}: SettingsPanelProps) => {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 animate-in fade-in"
          onClick={onClose}
        />
      )}
      
      {/* Panel */}
      <div
        className={cn(
          "fixed top-[72px] right-4 w-80 bg-card rounded-2xl shadow-medium border border-border z-50 transition-all duration-300",
          isOpen ? "translate-x-0 opacity-100" : "translate-x-[400px] opacity-0 pointer-events-none"
        )}
      >
        <div className="p-6 space-y-4">
          {/* Menu Items */}
          <button
            onClick={() => {}}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent transition-colors text-left group"
          >
            <Phone className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Voice call</span>
          </button>

          <button
            onClick={() => {}}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent transition-colors text-left group"
          >
            <Video className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Video call</span>
          </button>

          <button
            onClick={onShowTips}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent transition-colors text-left group"
          >
            <Lightbulb className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Tips</span>
          </button>

          <button
            onClick={onClearCache}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent transition-colors text-left group"
          >
            <RotateCcw className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">cache</span>
          </button>

          <button
            onClick={onShowFeedback}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent transition-colors text-left group"
          >
            <MessageSquare className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">feedback</span>
          </button>

          {/* Toggle Settings */}
          <div className="pt-4 space-y-4 border-t border-border">
            <DarkModeToggle />

            <div className="space-y-2">
              <label className="text-sm font-semibold text-primary">AI mode</label>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button
                    variant={settings.aiMode ? "default" : "outline"}
                    size="sm"
                    className="rounded-full px-6"
                    onClick={() => onSettingChange('aiMode', true)}
                  >
                    On
                  </Button>
                  <Button
                    variant={!settings.aiMode ? "secondary" : "outline"}
                    size="sm"
                    className="rounded-full px-6"
                    onClick={() => onSettingChange('aiMode', false)}
                  >
                    Off
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-primary">Voice call</label>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button
                    variant={settings.voiceCall ? "default" : "outline"}
                    size="sm"
                    className="rounded-full px-6"
                    onClick={() => onSettingChange('voiceCall', true)}
                  >
                    On
                  </Button>
                  <Button
                    variant={!settings.voiceCall ? "secondary" : "outline"}
                    size="sm"
                    className="rounded-full px-6"
                    onClick={() => onSettingChange('voiceCall', false)}
                  >
                    Off
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-primary">Video call</label>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button
                    variant={settings.videoCall ? "default" : "outline"}
                    size="sm"
                    className="rounded-full px-6"
                    onClick={() => onSettingChange('videoCall', true)}
                  >
                    On
                  </Button>
                  <Button
                    variant={!settings.videoCall ? "secondary" : "outline"}
                    size="sm"
                    className="rounded-full px-6"
                    onClick={() => onSettingChange('videoCall', false)}
                  >
                    Off
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

import { Lightbulb, RotateCcw, MessageSquare, Moon, Sun } from "lucide-react";
import { Button, Offcanvas, Form } from "react-bootstrap";
import { useIsMobile } from "../hooks/use-mobile";
// Note: If you want true Next Themes support, keep the context provider setup in main.tsx or App.tsx 
// since we removed the Context, we can mock or remove theme toggling but I'll keep the buttons for UI structure.

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
  isDarkMode: boolean;
  onToggleDarkMode: (isDark: boolean) => void;
}

export const SettingsPanel = ({
  isOpen,
  onClose,
  settings,
  onSettingChange,
  onShowTips,
  onClearCache,
  onShowFeedback,
  isDarkMode,
  onToggleDarkMode
}: SettingsPanelProps) => {
  const isMobile = useIsMobile();

  return (
    <Offcanvas 
      show={isOpen} 
      onHide={onClose} 
      placement="end" 
      style={{ 
        width: isMobile ? '85vw' : '300px',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)'
      }}
      className={isDarkMode ? 'dark-theme' : ''}
    >
      <Offcanvas.Body className="d-flex flex-column gap-3">
      <Offcanvas.Header closeButton className={`border-0 ${isDarkMode ? 'btn-close-white' : ''}`}>
        <Offcanvas.Title className="fw-bold" style={{ color: 'var(--accent-color)' }}>Your Actions</Offcanvas.Title>
      </Offcanvas.Header>
        <Button variant="light" className="w-100 text-start d-flex align-items-center gap-3 p-3 rounded-3 border-0" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }} onClick={onShowTips}>
          <Lightbulb size={20} style={{ color: 'var(--accent-color)' }} />
          <span className="fw-medium">Tips for you</span>
        </Button>

        <Button variant="light" className="w-100 text-start d-flex align-items-center gap-3 p-3 rounded-3 border-0" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }} onClick={onClearCache}>
          <RotateCcw size={20} style={{ color: 'var(--accent-color)' }} />
          <span className="fw-medium">Clear your cache</span>
        </Button>

        <Button variant="light" className="w-100 text-start d-flex align-items-center gap-3 p-3 rounded-3 border-0" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }} onClick={onShowFeedback}>
          <MessageSquare size={20} style={{ color: 'var(--accent-color)' }} />
          <span className="fw-medium">Your feedback</span>
        </Button>

        <hr className="my-2" />

        {/* Theme Toggle placeholder */}
        <div className="d-flex justify-content-between align-items-center">
          <span className="fw-bold text-secondary small">Theme</span>
          <div className="d-flex gap-2">
            <Button 
              variant={!isDarkMode ? "dark" : "outline-secondary"} 
              size="sm" 
              className="rounded-pill px-3 d-flex align-items-center"
              onClick={() => onToggleDarkMode(false)}
            >
              <Sun size={14} className="me-2" /> Light
            </Button>
            <Button 
              variant={isDarkMode ? "primary" : "outline-secondary"} 
              size="sm" 
              className="rounded-pill px-3 d-flex align-items-center border-0"
              style={{ backgroundColor: isDarkMode ? 'var(--accent-color)' : '' }}
              onClick={() => onToggleDarkMode(true)}
            >
              <Moon size={14} className="me-2" /> Dark
            </Button>
          </div>
        </div>

        {/* AI Mode */}
        <div className="d-flex justify-content-between align-items-center mt-2">
          <span className="fw-bold text-secondary small">AI mode (coming soon)</span>
          <Form.Check 
            type="switch" 
            id="ai-mode-switch" 
            checked={settings.aiMode} 
            className="custom-switch"
            onChange={(e) => onSettingChange('aiMode', e.target.checked)}
          />
        </div>

        {/* Voice Call */}
        <div className="d-flex justify-content-between align-items-center">
          <span className="fw-bold text-secondary small">Block voice call</span>
          <Form.Check 
            type="switch" 
            id="voice-call-switch" 
            checked={settings.voiceCall} 
            className="custom-switch"
            onChange={(e) => onSettingChange('voiceCall', e.target.checked)}
          />
        </div>

        {/* Video Call */}
        <div className="d-flex justify-content-between align-items-center">
          <span className="fw-bold text-secondary small">Block video call</span>
          <Form.Check 
            type="switch" 
            id="video-call-switch" 
            checked={settings.videoCall} 
            className="custom-switch"
            onChange={(e) => onSettingChange('videoCall', e.target.checked)}
          />
        </div>

      </Offcanvas.Body>
    </Offcanvas>
  );
};

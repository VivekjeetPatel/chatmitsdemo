import { Plus, Mic } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onVoiceInput: () => void;
  onMediaUpload: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export const ChatInput = ({ 
  onSendMessage, 
  onVoiceInput, 
  onMediaUpload,
  placeholder = "Say something nicer...",
  disabled = false
}: ChatInputProps) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className={`relative flex items-center gap-3 px-5 py-3 bg-background border border-border rounded-full shadow-soft hover:border-primary/30 transition-all duration-300 focus-within:border-primary/50 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onMediaUpload}
          disabled={disabled}
          className="shrink-0 h-9 w-9 rounded-full hover:bg-accent text-foreground/70 hover:text-primary disabled:opacity-50"
        >
          <Plus className="h-5 w-5" />
        </Button>
        
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 min-h-[36px] max-h-[120px] border-0 bg-transparent resize-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground text-sm disabled:cursor-not-allowed"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onVoiceInput}
          disabled={disabled}
          className="shrink-0 h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 shadow-sm"
        >
          <Mic className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};

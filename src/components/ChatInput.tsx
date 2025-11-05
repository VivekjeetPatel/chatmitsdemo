import { Plus, Mic } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onVoiceInput: () => void;
  onMediaUpload: () => void;
  placeholder?: string;
}

export const ChatInput = ({ 
  onSendMessage, 
  onVoiceInput, 
  onMediaUpload,
  placeholder = "Say something nicer..." 
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
      <div className="relative flex items-center gap-2 px-4 py-3 bg-background border-2 border-primary/20 rounded-3xl shadow-soft hover:border-primary/40 transition-all duration-300 focus-within:border-primary focus-within:shadow-glow">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onMediaUpload}
          className="shrink-0 h-10 w-10 rounded-full hover:bg-primary/10 text-primary"
        >
          <Plus className="h-5 w-5" />
        </Button>
        
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder}
          className="flex-1 min-h-[40px] max-h-[120px] border-0 bg-transparent resize-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60 text-base"
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
          className="shrink-0 h-12 w-12 rounded-full bg-primary/10 hover:bg-primary/20 text-primary"
        >
          <Mic className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
};

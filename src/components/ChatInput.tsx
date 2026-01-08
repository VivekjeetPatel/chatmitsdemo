import { Plus, Mic } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onVoiceInput: () => void;
  onMediaUpload: () => void;
  placeholder?: string;
  disabled?: boolean;
  disabledMessage?: string;
}

export const ChatInput = ({ 
  onSendMessage, 
  onVoiceInput, 
  onMediaUpload,
  placeholder = "Say something nicer...",
  disabled = false,
  disabledMessage = "Select filters first, then click New chat to start chatting."
}: ChatInputProps) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleClick = () => {
    if (disabled) {
      // Optionally show toast here if you want
      return;
    }
  };

  const inputContent = (
    <form onSubmit={handleSubmit} className="w-full">
      <div 
        className={`relative flex items-center gap-3 px-5 py-3 bg-background border border-border rounded-full shadow-[0_6px_15px_rgba(0,0,0,0.20)] hover:border-primary/30 transition-all duration-300 focus-within:border-primary/50 ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
        onClick={handleClick}
      >
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
          onChange={(e) => !disabled && setMessage(e.target.value)}
          placeholder={disabled ? disabledMessage : placeholder}
          disabled={disabled}
          className="flex-1 min-h-[36px] max-h-[120px] border-0 bg-transparent resize-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground text-sm disabled:cursor-not-allowed"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !disabled) {
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

  if (disabled) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {inputContent}
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <p>{disabledMessage}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return inputContent;
};
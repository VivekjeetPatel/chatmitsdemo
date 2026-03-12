import { Plus, Mic } from "lucide-react";
import { useState, useRef } from "react";
import { Button, Form, OverlayTrigger, Tooltip } from "react-bootstrap";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onVoiceInput: () => void;
  onMediaUpload: (base64Media: string) => void;
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          onMediaUpload(ev.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
    // Reset file input
    if (e.target) e.target.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const inputContent = (
    <Form onSubmit={handleSubmit} className="w-100">
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept="image/*" 
        onChange={handleFileChange} 
      />
      <div 
        className={`d-flex align-items-center gap-3 px-3 py-2 bg-white border rounded-pill shadow-sm ${disabled ? 'opacity-75' : ''}`}
        style={disabled ? { cursor: 'not-allowed' } : {}}
      >
        <Button
          type="button"
          variant="light"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="rounded-circle d-flex align-items-center justify-content-center p-2"
          style={{ width: '40px', height: '40px' }}
        >
          <Plus size={20} />
        </Button>
        
        <Form.Control
          as="textarea"
          rows={1}
          value={message}
          onChange={(e) => !disabled && setMessage(e.target.value)}
          placeholder={disabled ? disabledMessage : placeholder}
          disabled={disabled}
          className="flex-grow-1 border-0 shadow-none bg-transparent"
          style={{ resize: 'none', overflowY: 'hidden' }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !disabled) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        
        <Button
          type="button"
          variant="primary"
          onClick={onVoiceInput}
          disabled={disabled}
          className="rounded-circle d-flex align-items-center justify-content-center p-2 text-white"
          style={{ width: '40px', height: '40px', backgroundColor: '#FF6200', borderColor: '#FF6200' }}
        >
          <Mic size={20} />
        </Button>
      </div>
    </Form>
  );

  if (disabled) {
    return (
      <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-disabled">{disabledMessage}</Tooltip>}>
        <div className="w-100">{inputContent}</div>
      </OverlayTrigger>
    );
  }

  return inputContent;
};
import { Plus, Mic, Send, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button, Form, OverlayTrigger, Tooltip } from "react-bootstrap";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onVoiceSend?: (base64Audio: string) => void;
  onMediaUpload: (base64Media: string) => void;
  placeholder?: string;
  disabled?: boolean;
  disabledMessage?: string;
}

export const ChatInput = ({ 
  onSendMessage, 
  onVoiceSend,
  onMediaUpload,
  placeholder = "Say something nicer...",
  disabled = false,
  disabledMessage = "Select filters, then click New chat to start chatting."
}: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [slideOffset, setSlideOffset] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const isCancelledRef = useRef(false);
  const startXRef = useRef(0);

  const startRecording = async (e: React.PointerEvent) => {
    if (disabled || message.trim()) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      isCancelledRef.current = false;
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        if (!isCancelledRef.current && chunksRef.current.length > 0) {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = () => {
            const base64Audio = reader.result as string;
            if (onVoiceSend) onVoiceSend(base64Audio);
          };
        }
        // Cleanup states
        setIsRecording(false);
        setRecordingTime(0);
        setSlideOffset(0);
        clearInterval(timerRef.current);
      };

      mediaRecorder.start();
      setIsRecording(true);
      startXRef.current = e.clientX;
      
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 60) {
            // max 60 seconds
            stopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
      
      // Need pointer capture to track slide globally until release
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {
      console.error("Could not start recording", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isRecording) return;
    const diff = e.clientX - startXRef.current;
    if (diff < 0) {
      setSlideOffset(diff);
      if (diff < -100) {
        // Cancel threshold reached
        isCancelledRef.current = true;
        stopRecording();
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isRecording) {
      stopRecording();
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

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
    if (e.target) e.target.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled && !isRecording) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const inputContent = (
    <Form onSubmit={handleSubmit} className="w-100 position-relative">
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept="image/*" 
        onChange={handleFileChange} 
      />
      <div 
        className={`d-flex align-items-center gap-2 px-2 py-2 border rounded-pill shadow-sm overflow-hidden ${disabled ? 'opacity-75' : ''}`}
        style={{ backgroundColor: 'var(--bg-secondary)', ...(disabled ? { cursor: 'not-allowed' } : {}) }}
      >
        {!isRecording && (
          <Button
            type="button"
            variant="light"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="rounded-circle d-flex align-items-center justify-content-center p-2 border-0"
            style={{ minWidth: '40px', height: '40px', backgroundColor: 'transparent' }}
          >
            <Plus size={20} color="var(--text-secondary)" />
          </Button>
        )}
        
        {isRecording ? (
          <div className="flex-grow-1 d-flex align-items-center justify-content-between px-3" style={{ opacity: Math.max(0, 1 + slideOffset / 100) }}>
            <div className="d-flex align-items-center gap-2 text-danger">
              <span className="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
              <span className="fw-medium font-monospace">{formatTime(recordingTime)}</span>
            </div>
            <div className="text-secondary small d-flex align-items-center gap-1" style={{ transform: `translateX(${slideOffset}px)` }}>
               {"< Slide to cancel"}
            </div>
          </div>
        ) : (
          <Form.Control
            as="textarea"
            rows={1}
            value={message}
            onChange={(e) => !disabled && setMessage(e.target.value)}
            placeholder={disabled ? disabledMessage : placeholder}
            disabled={disabled}
            className="flex-grow-1 border-0 shadow-none bg-transparent px-2"
            style={{ resize: 'none', overflowY: 'hidden', color: 'var(--text-primary)' }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !disabled) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
        )}
        
        <Button
          type={message.trim() ? "submit" : "button"}
          variant="primary"
          onPointerDown={message.trim() ? undefined : startRecording}
          onPointerMove={message.trim() ? undefined : handlePointerMove}
          onPointerUp={message.trim() ? undefined : handlePointerUp}
          onPointerCancel={message.trim() ? undefined : handlePointerUp}
          disabled={disabled}
          className="rounded-circle d-flex align-items-center justify-content-center p-2 text-white border-0 flex-shrink-0"
          style={{ 
            width: isRecording ? '48px' : '40px', 
            height: isRecording ? '48px' : '40px', 
            backgroundColor: 'var(--accent-color)',
            transform: `translateX(${isRecording ? slideOffset : 0}px)`,
            opacity: disabled ? 0.5 : 1,
            transition: isRecording ? 'none' : 'all 0.2s ease',
            cursor: 'pointer',
            touchAction: 'none' // Prevent scrolling while sliding
          }}
        >
          {message.trim() ? <Send size={20} /> : <Mic size={isRecording ? 24 : 20} />}
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
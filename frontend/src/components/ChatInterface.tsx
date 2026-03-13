import { useEffect, useRef, useState } from 'react';
import { Button } from 'react-bootstrap';

interface ChatInterfaceProps {
  sessionId: string;
  userId: string;
  peerId: string;
  onSendMessage: (message: string) => void;
  onMediaUpload: any;
  onCallFunctionsReady?: (functions: any) => void;
  stompClient?: any;
  onEndSessionReceived?: () => void;
}

interface Message {
  id?: string;
  senderId?: string;
  sender_id?: string;
  message: string;
  messageType?: string;
  message_type?: string;
  createdAt?: string;
  created_at?: string;
}

export const ChatInterface = ({ 
  sessionId, 
  userId, 
  peerId,
  onSendMessage,
  onMediaUpload,
  onCallFunctionsReady,
  stompClient,
  onEndSessionReceived
}: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const subscriptionRef = useRef<any>(null);

  // Fetch initial history from REST Server
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/chat/${sessionId}/messages`);
        const data = await response.json();
        setMessages(data);
      } catch (err) {
        console.error('Error fetching chat history:', err);
      }
    };
    fetchHistory();
  }, [sessionId]);

  // Subscribe to Live STOMP messages
  useEffect(() => {
    if (!stompClient || !stompClient.current) return;
    const client = stompClient.current;
    
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }

    subscriptionRef.current = client.subscribe(`/topic/session/${sessionId}`, (messageObj: any) => {
      const msg = JSON.parse(messageObj.body);
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [sessionId, stompClient]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="d-flex flex-column h-100 position-relative" style={{ minHeight: '300px' }}>
      <div 
        className="flex-grow-1 p-3 overflow-auto" 
        ref={scrollRef}
      >
        <div className="d-flex flex-column gap-3">
          {messages.length === 0 && (
            <div className="text-center text-muted my-5">
              No messages yet...
            </div>
          )}
          {messages.map((msg, index) => {
             const sender = msg.senderId || msg.sender_id;
             const isMe = sender === userId;
             const type = msg.messageType || msg.message_type || "TEXT";
             
             return (
              <div
                key={msg.id || index}
                className={`d-flex ${isMe ? 'justify-content-end' : 'justify-content-start'}`}
              >
                <div
                  className={`p-3 rounded-4 shadow-sm text-break ${type === 'IMAGE' ? 'p-2' : ''}`}
                  style={{ 
                    maxWidth: '75%', 
                    backgroundColor: isMe ? '#FF6200' : '#f8f9fa',
                    color: isMe ? '#fff' : '#000'
                  }}
                >
                  {type === 'IMAGE' ? (
                     <img src={msg.message} alt="media payload" className="img-fluid rounded-3 shadow-sm" style={{ maxHeight: '250px', objectFit: 'cover' }} />
                  ) : (
                    <p className="mb-0 fs-6">{msg.message}</p>
                  )}
                </div>
              </div>
             )
          })}
        </div>
      </div>
    </div>
  );
};

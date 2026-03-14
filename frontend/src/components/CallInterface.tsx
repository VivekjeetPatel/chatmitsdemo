import { useEffect, useRef } from 'react';
import { Button } from 'react-bootstrap';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';

interface CallInterfaceProps {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isVideoCall: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
}

export const CallInterface = ({
  localStream,
  remoteStream,
  isVideoCall,
  isMuted,
  isVideoOff,
  onEndCall,
  onToggleMute,
  onToggleVideo
}: CallInterfaceProps) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div className="d-flex flex-column h-100 bg-dark text-white rounded-4 overflow-hidden position-relative">
      {/* Remote Video / Audio indicator */}
      <div className="flex-grow-1 position-relative d-flex align-items-center justify-content-center bg-black">
        {isVideoCall ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div className="text-center">
            <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center mb-3 mx-auto" style={{ width: 100, height: 100 }}>
              <Mic size={40} className="text-white" />
            </div>
            <h4>Voice Call</h4>
            <p className="text-muted">{remoteStream ? 'Connected' : 'Connecting...'}</p>
          </div>
        )}
        
        {/* Local Video Picture-in-Picture */}
        {isVideoCall && (
          <div 
            className="position-absolute rounded overflow-hidden shadow" 
            style={{ 
              width: '120px', 
              height: '160px', 
              bottom: '20px', 
              right: '20px', 
              backgroundColor: '#333',
              border: '2px solid rgba(255,255,255,0.2)'
            }}
          >
             <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted // Always mute local video playback to prevent feedback loop
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: isVideoOff ? 'none' : 'block' }}
            />
            {isVideoOff && (
              <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-secondary">
                <VideoOff size={30} className="text-white" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className="d-flex justify-content-center align-items-center p-3 gap-4 bg-dark" style={{ borderTop: '1px solid #333' }}>
        <Button 
          variant={isMuted ? "danger" : "secondary"} 
          className="rounded-circle p-3 d-flex align-items-center justify-content-center shadow"
          onClick={onToggleMute}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
        </Button>
        
        {isVideoCall && (
          <Button 
            variant={isVideoOff ? "danger" : "secondary"} 
            className="rounded-circle p-3 d-flex align-items-center justify-content-center shadow"
            onClick={onToggleVideo}
            title={isVideoOff ? "Turn on Camera" : "Turn off Camera"}
          >
            {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
          </Button>
        )}

        <Button 
          variant="danger" 
          className="rounded-circle p-3 d-flex align-items-center justify-content-center shadow-lg px-4"
          onClick={onEndCall}
          title="End Call"
        >
          <PhoneOff size={24} className="me-2" /> End Call
        </Button>
      </div>
    </div>
  );
};

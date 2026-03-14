import { useEffect, useRef, useState } from 'react';

export type CallStatus = 'idle' | 'calling' | 'ringing' | 'connected';

interface UseWebRTCProps {
  sessionId: string;
  userId: string;
  peerId: string;
  stompClient: any;
}

export const useWebRTC = ({ sessionId, userId, peerId, stompClient }: UseWebRTCProps) => {
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const signalingSubscription = useRef<any>(null);

  // Initialize PeerConnection
  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignalingMessage({
          type: 'candidate',
          payload: event.candidate
        });
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
        endCall();
      }
    };

    peerConnection.current = pc;
    return pc;
  };

  const sendSignalingMessage = (message: any) => {
    if (stompClient?.current?.connected) {
      stompClient.current.publish({
        destination: '/app/chat.signal',
        body: JSON.stringify({
          ...message,
          senderId: userId,
          sessionId: sessionId
        })
      });
    }
  };

  // Set up signaling channel
  useEffect(() => {
    if (!sessionId || !stompClient || !stompClient.current) return;

    signalingSubscription.current = stompClient.current.subscribe(
      `/topic/session/${sessionId}/signal`,
      async (message: any) => {
        const signal = JSON.parse(message.body);
        if (signal.senderId === userId) return; // Ignore our own signals

        const pc = peerConnection.current;

        try {
          if (signal.type === 'offer') {
            setCallStatus('ringing');
            setIsVideoCall(signal.payload.sdp.includes('m=video')); // basic check for video
            
            // Auto initialize pc to handle incoming offer
            if (!pc) createPeerConnection();
            await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(signal.payload));
          } else if (signal.type === 'answer' && pc) {
            await pc.setRemoteDescription(new RTCSessionDescription(signal.payload));
            setCallStatus('connected');
          } else if (signal.type === 'candidate' && pc) {
            await pc.addIceCandidate(new RTCIceCandidate(signal.payload));
          } else if (signal.type === 'end_call') {
            cleanupCall();
          }
        } catch (err) {
          console.error('Signaling error:', err);
        }
      }
    );

    return () => {
      if (signalingSubscription.current) {
        signalingSubscription.current.unsubscribe();
      }
    };
  }, [sessionId, userId, stompClient]);

  const startCall = async (video: boolean) => {
    setIsVideoCall(video);
    setCallStatus('calling');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video, audio: true });
      setLocalStream(stream);

      const pc = createPeerConnection();
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      sendSignalingMessage({
        type: 'offer',
        payload: offer
      });
    } catch (err) {
      console.error('Error starting call:', err);
      setCallStatus('idle');
    }
  };

  const answerCall = async () => {
    setCallStatus('connected');
    const pc = peerConnection.current;
    if (!pc) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: isVideoCall, audio: true });
      setLocalStream(stream);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      sendSignalingMessage({
        type: 'answer',
        payload: answer
      });
    } catch (err) {
      console.error('Error answering call:', err);
      endCall();
    }
  };

  const rejectCall = () => {
    sendSignalingMessage({ type: 'end_call' });
    cleanupCall();
  };

  const endCall = () => {
    sendSignalingMessage({ type: 'end_call' });
    cleanupCall();
  };

  const cleanupCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    setRemoteStream(null);
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    setCallStatus('idle');
    setIsMuted(false);
    setIsVideoOff(false);
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  return {
    callStatus,
    isVideoCall,
    localStream,
    remoteStream,
    startCall,
    answerCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
    isMuted,
    isVideoOff
  };
};

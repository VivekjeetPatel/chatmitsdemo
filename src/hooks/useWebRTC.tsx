import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface WebRTCHookProps {
  sessionId: string | null;
  userId: string;
  peerId: string | null;
  onRemoteStream?: (stream: MediaStream) => void;
}

export const useWebRTC = ({ sessionId, userId, peerId, onRemoteStream }: WebRTCHookProps) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const signalChannel = useRef<any>(null);

  const configuration: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  // Initialize peer connection
  const createPeerConnection = () => {
    if (peerConnection.current) return peerConnection.current;

    const pc = new RTCPeerConnection(configuration);

    pc.onicecandidate = (event) => {
      if (event.candidate && sessionId && peerId) {
        sendSignal('ice-candidate', event.candidate);
      }
    };

    pc.ontrack = (event) => {
      console.log('Received remote track');
      const stream = event.streams[0];
      setRemoteStream(stream);
      if (onRemoteStream) {
        onRemoteStream(stream);
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        endCall();
      }
    };

    peerConnection.current = pc;
    return pc;
  };

  // Send signaling data
  const sendSignal = async (type: string, data: any) => {
    if (!sessionId || !peerId) return;

    try {
      await (supabase as any)
        .from('webrtc_signals')
        .insert({
          session_id: sessionId,
          sender_id: userId,
          receiver_id: peerId,
          signal_type: type,
          signal_data: data
        });
    } catch (error) {
      console.error('Error sending signal:', error);
    }
  };

  // Start voice call
  const startVoiceCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: false 
      });
      
      setLocalStream(stream);
      setIsCallActive(true);
      setIsAudioEnabled(true);

      const pc = createPeerConnection();
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await sendSignal('offer', offer);

      toast.success('Voice call started');
    } catch (error) {
      console.error('Error starting voice call:', error);
      toast.error('Failed to start voice call');
    }
  };

  // Start video call
  const startVideoCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: true 
      });
      
      setLocalStream(stream);
      setIsCallActive(true);
      setIsVideoEnabled(true);
      setIsAudioEnabled(true);

      const pc = createPeerConnection();
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await sendSignal('offer', offer);

      toast.success('Video call started');
    } catch (error) {
      console.error('Error starting video call:', error);
      toast.error('Failed to start video call');
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  // End call
  const endCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }

    setRemoteStream(null);
    setIsCallActive(false);
    setIsVideoEnabled(false);
    setIsAudioEnabled(true);
    
    toast.info('Call ended');
  };

  // Listen for signals
  useEffect(() => {
    if (!sessionId || !peerId) return;

    const channel = supabase
      .channel('webrtc-signals')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'webrtc_signals',
          filter: `receiver_id=eq.${userId}`
        },
        async (payload: any) => {
          const signal = payload.new;
          console.log('Received signal:', signal.signal_type);

          const pc = createPeerConnection();

          if (signal.signal_type === 'offer') {
            await pc.setRemoteDescription(new RTCSessionDescription(signal.signal_data));
            
            // Get user media for answer
            const stream = await navigator.mediaDevices.getUserMedia({ 
              audio: true, 
              video: signal.signal_data.sdp.includes('m=video')
            });
            
            setLocalStream(stream);
            setIsCallActive(true);
            setIsVideoEnabled(signal.signal_data.sdp.includes('m=video'));
            
            stream.getTracks().forEach(track => {
              pc.addTrack(track, stream);
            });

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            await sendSignal('answer', answer);
            
            toast.info('Incoming call accepted');
          } else if (signal.signal_type === 'answer') {
            await pc.setRemoteDescription(new RTCSessionDescription(signal.signal_data));
          } else if (signal.signal_type === 'ice-candidate') {
            await pc.addIceCandidate(new RTCIceCandidate(signal.signal_data));
          }
        }
      )
      .subscribe();

    signalChannel.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, userId, peerId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endCall();
    };
  }, []);

  return {
    localStream,
    remoteStream,
    isCallActive,
    isVideoEnabled,
    isAudioEnabled,
    startVoiceCall,
    startVideoCall,
    toggleAudio,
    toggleVideo,
    endCall
  };
};

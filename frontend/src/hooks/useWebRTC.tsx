import { useState } from 'react';

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

  // Stubbing the WebRTC functions for now since we removed the Supabase signaling.
  // This will be re-implemented with Spring Boot WebSockets.

  const startVoiceCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: false 
      });
      setLocalStream(stream);
      setIsCallActive(true);
      setIsAudioEnabled(true);
      console.log('Voice call started (mock)');
    } catch (error) {
      console.error('Error starting voice call:', error);
    }
  };

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
      console.log('Video call started (mock)');
    } catch (error) {
      console.error('Error starting video call:', error);
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const endCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    setRemoteStream(null);
    setIsCallActive(false);
    setIsVideoEnabled(false);
    setIsAudioEnabled(true);
    console.log('Call ended (mock)');
  };

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

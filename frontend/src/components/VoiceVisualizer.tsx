import React, { useEffect, useRef } from "react";

interface VoiceVisualizerProps {
  stream: MediaStream | null;
}

export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({ stream }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const srcRef = useRef<MediaStreamAudioSourceNode | null>(null);

  useEffect(() => {
    if (!stream || !canvasRef.current) return;
    audioCtxRef.current = new window.AudioContext();
    analyserRef.current = audioCtxRef.current.createAnalyser();
    srcRef.current = audioCtxRef.current.createMediaStreamSource(stream);
    srcRef.current.connect(analyserRef.current);
    analyserRef.current.fftSize = 64;
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const ctx = canvasRef.current.getContext("2d")!;
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;

    const draw = () => {
      analyserRef.current!.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, width, height);
      const barWidth = width / bufferLength;
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * (height - 8);
        ctx.fillStyle = "#FF6200";
        ctx.fillRect(i * barWidth + 2, height - barHeight - 4, barWidth - 4, Math.max(barHeight, 3));
        
        ctx.beginPath();
        ctx.arc(i * barWidth + barWidth / 2, height - barHeight - 4, (barWidth - 4) / 2, 0, 2 * Math.PI);
        ctx.fill();
      }
      requestAnimationFrame(draw);
    };
    draw();
    return () => {
      srcRef.current?.disconnect();
      analyserRef.current?.disconnect();
      audioCtxRef.current?.close();
    };
  }, [stream]);

  return (
    <canvas
      ref={canvasRef}
      width={260}
      height={80}
      className="w-100 rounded-3 bg-light border"
    />
  );
};

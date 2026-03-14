import { useState, useEffect, useRef } from 'react';
import { UserFilters } from '../components/InterestFilterModal';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

interface MatchResult {
  success: boolean;
  matched: boolean;
  session?: {
    id: string;
    user1Id: string;
    user2Id: string;
    status: string;
  };
  matchScore?: number;
  queuePosition?: number;
  message?: string;
}

export const useMatchmaking = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [userId] = useState(() => crypto.randomUUID());
  
  const stompClient = useRef<Client | null>(null);

  useEffect(() => {
    // Setup STOMP WebSocket Client
    const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
    const socket = new SockJS(`${API_BASE_URL}/ws`);
    const client = new Client({
      webSocketFactory: () => socket as any,
      reconnectDelay: 5000,
      debug: (str) => {
        console.log(str);
      },
    });

    client.onConnect = () => {
      console.log('Connected to Matchmaking WebSocket');
      // Subscribe to user's personal match topic
      client.subscribe(`/topic/match/${userId}`, (message) => {
        const body = JSON.parse(message.body);
        console.log('Match received!', body);
        setMatchResult(body);
        setIsSearching(false);
      });
    };

    client.activate();
    stompClient.current = client;

    return () => {
      client.deactivate();
    };
  }, [userId]);

  const findMatch = async (filters: UserFilters) => {
    setIsSearching(true);
    setMatchResult(null);

    try {
      // POST to Spring Boot Matchmaker
      const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
      const response = await fetch(`${API_BASE_URL}/api/matchmaking/find`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, filters })
      });

      const data = await response.json();
      
      if (!data.matched) {
        // We are placed in the queue and wait for the STOMP message
        setMatchResult({
           success: true,
           matched: false,
           message: "Waiting for a compatible match..."
        });
      } else {
         // Rare case: matched instantly on the HTTP response (not implemented in the new service, but just in case)
         setMatchResult(data);
         setIsSearching(false);
      }
      return data;
    } catch (error) {
       console.error("Matchmaking error", error);
       setIsSearching(false);
       return { success: false, matched: false };
    }
  };

  const cancelMatch = async () => {
    setIsSearching(false);
    try {
      const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
      await fetch(`${API_BASE_URL}/api/matchmaking/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
    } catch (e) {
      console.error(e);
    }
  };

  return {
    findMatch,
    cancelMatch,
    isSearching,
    matchResult,
    userId,
    stompClient
  };
};

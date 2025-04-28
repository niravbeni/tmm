'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useRouter } from 'next/navigation';

interface SocketContextType {
  socket: Socket | null;
  gameState: GameState | null;
  teamName: string;
  setTeamName: (name: string) => void;
  isLoading: boolean;
}

export interface Team {
  hand: string[];
  score: number;
  socketId: string;
  isHost?: boolean;
}

export interface PlayedCard {
  teamName: string;
  card: string;
}

export type GamePhase = 'lobby' | 'hand' | 'vote' | 'results' | 'waiting';

export interface GameState {
  teams: Record<string, Team>;
  storytellerTeam: string;
  storytellerCard: string;
  playedCards: PlayedCard[];
  votes: Record<string, number>;
  currentPhase: GamePhase;
  roundNumber: number;
  hostId?: string;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  gameState: null,
  teamName: '',
  setTeamName: () => {},
  isLoading: true,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [teamName, setTeamName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    console.log('Connecting to backend at:', BACKEND_URL);
    
    // Initialize socket connection with reconnection options
    const socketInstance = io(BACKEND_URL, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      transports: ['websocket', 'polling']
    });
    
    setSocket(socketInstance);

    // Socket event listeners
    socketInstance.on('connect', () => {
      console.log('Connected to server successfully');
      setIsLoading(false);
    });
    
    socketInstance.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setIsLoading(false);
    });
    
    socketInstance.on('reconnect', (attemptNumber) => {
      console.log(`Reconnected on attempt: ${attemptNumber}`);
    });
    
    socketInstance.on('reconnect_error', (error) => {
      console.error('Reconnection error:', error);
    });
    
    socketInstance.on('disconnect', (reason) => {
      console.log('Disconnected:', reason);
      if (reason === 'io server disconnect') {
        // The server has forcefully disconnected the socket
        console.log('Attempting to reconnect...');
        socketInstance.connect();
      }
    });

    socketInstance.on('gameStateUpdate', (updatedGameState: GameState) => {
      setGameState(updatedGameState);
      
      // Clear teamName if the user's team no longer exists in the game state
      if (teamName && updatedGameState.teams && !updatedGameState.teams[teamName]) {
        setTeamName('');
      }
    });

    socketInstance.on('navigate', (path: string) => {
      // Never navigate away from results page
      if (typeof window !== 'undefined' && window.location.pathname.includes('/results')) {
        return;
      }
      
      // If navigating to the lobby, clear the team name
      if (path === '/') {
        setTeamName('');
      }
      router.push(path);
    });

    socketInstance.on('nextRoundStarted', () => {
      // Only navigate to hand page if not viewing the results page
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/results')) {
        router.push('/hand');
      }
    });

    socketInstance.on('votePhaseStarted', () => {
      // Only navigate to vote page if not viewing the results page and not already on vote page
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/results') && !window.location.pathname.includes('/vote')) {
        router.push('/vote');
      }
    });

    socketInstance.on('resultsPhaseStarted', () => {
      // Only navigate to waiting page if not viewing the results page
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/results')) {
        router.push('/waiting');
      }
    });

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, [router]);

  const value = {
    socket,
    gameState,
    teamName,
    setTeamName,
    isLoading,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}; 
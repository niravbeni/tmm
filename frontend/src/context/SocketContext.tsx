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
    // Initialize socket connection
    const socketInstance = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001');
    setSocket(socketInstance);

    // Socket event listeners
    socketInstance.on('connect', () => {
      console.log('Connected to server');
      setIsLoading(false);
    });

    socketInstance.on('gameStateUpdate', (updatedGameState: GameState) => {
      setGameState(updatedGameState);
      
      // Clear teamName if the user's team no longer exists in the game state
      if (teamName && updatedGameState.teams && !updatedGameState.teams[teamName]) {
        setTeamName('');
      }
    });

    socketInstance.on('navigate', (path: string) => {
      // If navigating to the lobby, clear the team name
      if (path === '/') {
        setTeamName('');
      }
      router.push(path);
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
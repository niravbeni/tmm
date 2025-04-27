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
  hostId?: string; // Socket ID of the host/facilitator
} 
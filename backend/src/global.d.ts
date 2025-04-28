// Add global type declarations 
interface Team {
  hand: string[];
  score: number;
  socketId: string;
  isHost: boolean;
}

interface PlayedCard {
  teamName: string;
  card: string;
}

interface TeamVotes {
  [teamName: string]: number;
}

interface Teams {
  [teamName: string]: Team;
}

declare global {
  interface Window {}
} 
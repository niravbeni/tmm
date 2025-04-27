'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/context/SocketContext';

// Team colors array (12 distinct pastel colors)
const TEAM_COLORS = [
  'bg-red-200',
  'bg-blue-200',
  'bg-green-200',
  'bg-yellow-200',
  'bg-purple-200',
  'bg-pink-200',
  'bg-indigo-200',
  'bg-orange-200',
  'bg-teal-200',
  'bg-cyan-200',
  'bg-emerald-200',
  'bg-amber-200',
];

// Team text colors for contrast
const TEAM_TEXT_COLORS = [
  'text-red-800',
  'text-blue-800',
  'text-green-800',
  'text-yellow-800',
  'text-purple-800',
  'text-pink-800',
  'text-indigo-800',
  'text-orange-800',
  'text-teal-800',
  'text-cyan-800',
  'text-emerald-800',
  'text-amber-800',
];

export default function WaitingPage() {
  const { socket, gameState, teamName, isLoading } = useSocket();
  const router = useRouter();
  
  // Get team color based on team index
  const getTeamColor = (teamId: string): string => {
    if (!gameState?.teams) return 'bg-gray-200';
    const teamIndex = Object.keys(gameState.teams).indexOf(teamId);
    return teamIndex >= 0 ? TEAM_COLORS[teamIndex % TEAM_COLORS.length] : 'bg-gray-200';
  };

  // Get team text color based on team index
  const getTeamTextColor = (teamId: string): string => {
    if (!gameState?.teams) return 'text-gray-800';
    const teamIndex = Object.keys(gameState.teams).indexOf(teamId);
    return teamIndex >= 0 ? TEAM_TEXT_COLORS[teamIndex % TEAM_TEXT_COLORS.length] : 'text-gray-800';
  };

  useEffect(() => {
    // No host-based redirection, just check for valid game state
    
    // Redirect back to lobby if not in active game or no team name
    if ((!teamName && !isLoading) || (!isLoading && gameState && gameState.currentPhase === 'lobby')) {
      router.replace('/');
    }
  }, [gameState, teamName, isLoading, router]);

  if (isLoading || !gameState) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="animate-pulse text-2xl font-medium">Loading...</div>
      </div>
    );
  }

  // If team not found
  if (!gameState.teams[teamName]) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <h1 className="mb-6 text-2xl font-bold text-center">Team not found</h1>
        <button
          onClick={() => router.push('/')}
          className="modern-button clickable"
        >
          Return to Lobby
        </button>
      </div>
    );
  }
  
  return (
    <main className="flex flex-col items-center justify-center p-4 h-full">
      <div className="w-full max-w-md">
        <div className="mb-6 w-16 h-16 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
        
        <h1 className="text-2xl font-bold mb-4 text-center">
          {gameState.currentPhase === 'vote' ? 'Waiting for teams to vote...' : 'Waiting for results...'}
        </h1>
        
        <div className="p-6 w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-lg font-medium mb-1">Round {gameState.roundNumber}</p>
              
              {gameState.currentPhase === 'results' && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Waiting for the next round to start
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800">
            <span className="font-medium truncate max-w-[70%]" title={teamName}>
              {teamName.length > 24 ? teamName.substring(0, 24) + "..." : teamName}
            </span>
            <span className={`${getTeamColor(teamName)} ${getTeamTextColor(teamName)} px-3 py-1 text-sm font-bold`}>
              {gameState.teams[teamName]?.score || 0} pts
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}

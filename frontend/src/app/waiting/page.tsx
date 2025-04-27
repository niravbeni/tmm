'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/context/SocketContext';

export default function WaitingPage() {
  const { socket, gameState, teamName, isLoading } = useSocket();
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to lobby if no team name
    if (!teamName && !isLoading) {
      router.push('/');
    }
  }, [teamName, isLoading, router]);

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

  const isHost = gameState.teams[teamName]?.isHost;

  return (
    <main className="flex flex-col items-center justify-center p-4 h-full">
      <div className="w-full max-w-lg flex flex-col items-center">
        <div className="mb-6 w-16 h-16 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin"></div>
        
        <h1 className="text-2xl font-bold mb-6 text-center">
          Waiting for results...
        </h1>
        
        <div className="card p-4 w-full mb-4">
          <p className="text-lg font-medium">Round {gameState.roundNumber}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            The facilitator is showing the results on the big screen. Please wait for the next round to start.
          </p>
        </div>
        
        <div className="card p-4 w-full">
          <h2 className="text-lg font-medium mb-1">Your team: {teamName}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Current score: {gameState.teams[teamName]?.score || 0} points</p>
        </div>
        
        {/* Host-only button to view results */}
        {isHost && (
          <div className="mt-6 w-full">
            <button
              onClick={() => router.push('/results')}
              className="modern-button w-full clickable"
            >
              View Results (Host Only)
            </button>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">As the host, you can view the results screen.</p>
          </div>
        )}
      </div>
    </main>
  );
} 
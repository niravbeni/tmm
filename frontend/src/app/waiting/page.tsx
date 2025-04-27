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
      <div className="flex min-h-screen flex-col items-center justify-center p-6 px-8">
        <h1 className="mb-8 text-4xl font-bold text-center">Loading...</h1>
      </div>
    );
  }

  // If team not found
  if (!gameState.teams[teamName]) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 px-8">
        <h1 className="mb-8 text-4xl font-bold text-center">Team not found</h1>
        <button
          onClick={() => router.push('/')}
          className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Return to Lobby
        </button>
      </div>
    );
  }

  const isHost = gameState.teams[teamName]?.isHost;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 px-8 sm:p-8 sm:px-12 overflow-hidden">
      <div className="w-full max-w-lg flex flex-col items-center h-full">
        <div className="mb-8 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        
        <h1 className="text-3xl font-bold mb-6 text-center">
          Waiting for results...
        </h1>
        
        <div className="bg-blue-50 p-5 px-6 rounded-lg w-full mb-5">
          <p className="text-lg font-semibold">Round {gameState.roundNumber}</p>
          <p className="text-gray-600 mt-2">
            The facilitator is showing the results on the big screen. Please wait for the next round to start.
          </p>
        </div>
        
        <div className="bg-green-50 p-5 px-6 rounded-lg w-full">
          <h2 className="text-lg font-semibold mb-1">Your team: {teamName}</h2>
          <p className="text-gray-600">Current score: {gameState.teams[teamName]?.score || 0} points</p>
        </div>
        
        {/* Host-only button to view results */}
        {isHost && (
          <div className="mt-8 w-full">
            <button
              onClick={() => router.push('/results')}
              className="w-full py-3 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 shadow-md"
            >
              View Results (Host Only)
            </button>
            <p className="mt-2 text-sm text-gray-500 text-center">As the host, you can view the results screen.</p>
          </div>
        )}
      </div>
      
      {/* Remove the Next.js logo by adding styles to hide it */}
      <style jsx global>{`
        .n-logo {
          display: none !important;
        }
      `}</style>
    </main>
  );
} 
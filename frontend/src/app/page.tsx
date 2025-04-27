'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/context/SocketContext';

export default function LobbyPage() {
  const { socket, gameState, setTeamName, isLoading } = useSocket();
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const [isHost, setIsHost] = useState(false);
  const router = useRouter();

  const handleJoinGame = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) {
      setError('Please enter a team name');
      return;
    }
    
    if (!socket) {
      setError('Unable to connect to server');
      return;
    }
    
    // Check if team name already exists
    if (gameState?.teams && gameState.teams[inputValue]) {
      setError('Team name already taken');
      return;
    }
    
    // Register the team with the server
    socket.emit('registerTeam', inputValue, isHost);
    setTeamName(inputValue);
    router.push('/hand');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="animate-pulse text-2xl font-medium">Connecting to server...</div>
      </div>
    );
  }

  // Get connected teams
  const connectedTeams = gameState?.teams ? Object.keys(gameState.teams) : [];
  
  // Check if there's already a facilitator/host in the game
  const facilitatorExists = connectedTeams.some(team => gameState?.teams[team]?.isHost);

  return (
    <main className="flex flex-col items-center justify-center p-4 h-full">
      <h1 className="mb-6 text-4xl font-bold tracking-tight">Say Less</h1>
      
      <div className="w-full max-w-md card p-6 rounded-lg">
        <h2 className="text-2xl font-medium mb-6 text-center">Enter Team Name</h2>
        
        <form onSubmit={handleJoinGame} className="space-y-4">
          <div>
            <label htmlFor="teamName" className="block text-sm font-medium mb-1">
              Team Name
            </label>
            <input
              type="text"
              id="teamName"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="modern-input w-full"
              placeholder="Enter team name"
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
          
          {/* Only show the facilitator checkbox if no facilitator exists yet */}
          {!facilitatorExists && (
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="host"
                  name="host"
                  type="checkbox"
                  checked={isHost}
                  onChange={(e) => setIsHost(e.target.checked)}
                  className="h-4 w-4 border-gray-300 rounded focus:ring-black"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="host" className="font-medium">I am the facilitator</label>
                <p className="text-gray-500 text-xs">Check this only if you are the workshop facilitator and will control the game display.</p>
              </div>
            </div>
          )}
          
          <button
            type="submit"
            className="modern-button w-full clickable"
          >
            Join Game
          </button>
        </form>
        
        {/* Connected Teams */}
        {connectedTeams.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Connected Teams ({connectedTeams.length})</h3>
            <ul className="card overflow-hidden rounded-md max-h-40 custom-scrollbar overflow-y-auto">
              {connectedTeams.map((team) => (
                <li 
                  key={team} 
                  className="py-2 px-3 border-b last:border-0 flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <span className="inline-block w-2 h-2 bg-black dark:bg-white rounded-full mr-2"></span>
                    {team}
                  </div>
                  {gameState?.teams[team]?.isHost && (
                    <span className="status-badge bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">Host</span>
                  )}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 text-center">
              The game will begin once all teams have joined.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

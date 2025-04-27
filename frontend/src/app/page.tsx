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
        <h1 className="mb-8 text-4xl font-bold text-center">Connecting to server...</h1>
      </div>
    );
  }

  // Get connected teams
  const connectedTeams = gameState?.teams ? Object.keys(gameState.teams) : [];
  
  // Check if there's already a facilitator/host in the game
  const facilitatorExists = connectedTeams.some(team => gameState?.teams[team]?.isHost);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="mb-8 text-4xl font-bold text-center">Say Less</h1>
      
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6 text-center">Enter Your Team Name</h2>
        
        <form onSubmit={handleJoinGame} className="space-y-4">
          <div>
            <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 mb-1">
              Team Name
            </label>
            <input
              type="text"
              id="teamName"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="host" className="font-medium text-gray-700">I am the facilitator</label>
                <p className="text-gray-500">Check this only if you are the workshop facilitator and will control the game display.</p>
              </div>
            </div>
          )}
          
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Join Game
          </button>
        </form>
        
        {/* Connected Teams */}
        {connectedTeams.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-2">Connected Teams ({connectedTeams.length})</h3>
            <ul className="bg-gray-50 p-3 rounded-md max-h-40 overflow-y-auto">
              {connectedTeams.map((team, index) => (
                <li 
                  key={team} 
                  className="py-1 px-2 border-b last:border-0 flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    {team}
                  </div>
                  {gameState?.teams[team]?.isHost && (
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">Host</span>
                  )}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-gray-600 text-center">
              The game will begin once all teams have joined.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSocket } from '@/context/SocketContext';
import { PlayedCard } from '@/context/SocketContext';

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

export default function ResultsPage() {
  const { socket, gameState, teamName, isLoading } = useSocket();
  const [showResetModal, setShowResetModal] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [teamName, isLoading, router]);

  // No redirection logic - results page should always be accessible
  // Even if no team is selected or user navigates here manually

  const handleNextRound = () => {
    if (!socket) return;
    socket.emit('nextRound');
    // Don't redirect away from results page
  };

  const handleResetGame = () => {
    if (!socket) return;
    socket.emit('resetGame');
    setShowResetModal(false);
  };
  
  const nextCard = () => {
    if (!gameState?.playedCards) return;
    setCurrentCardIndex((prev) => 
      prev === gameState.playedCards.length - 1 ? 0 : prev + 1
    );
  };
  
  const prevCard = () => {
    if (!gameState?.playedCards) return;
    setCurrentCardIndex((prev) => 
      prev === 0 ? gameState.playedCards.length - 1 : prev - 1
    );
  };
  
  if (isLoading || !gameState) {
    return (
      <main className="flex flex-col h-full no-scroll results-page">
        <div className="w-full mx-auto flex flex-col p-4 pb-4 h-full">
          {/* Header */}
          <div className="mb-2 flex items-center justify-between">
            <div className="status-badge bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
              Results - No Active Game
            </div>
          </div>
          
          {/* Main content */}
          <div className="flex flex-col md:flex-row gap-3 h-[calc(100%-100px)]">
            {/* Empty Scoreboard */}
            <div className="md:w-1/4 lg:w-1/5 flex-shrink-0 card flex flex-col h-full">
              <h2 className="text-sm font-bold p-2 border-b">Scoreboard</h2>
              <div className="overflow-y-auto custom-scrollbar flex-1">
                <p className="text-sm p-3 text-gray-500">No teams have joined yet</p>
              </div>
              
              {/* Control buttons */}
              <div className="p-2 border-t flex flex-col gap-2 mt-auto">
                <button
                  disabled={!socket}
                  className="modern-button text-xs w-full clickable"
                  onClick={handleNextRound}
                >
                  {!gameState || gameState.currentPhase === 'lobby' ? 'Start Game' : 'Next Round'}
                </button>
                
                <button
                  disabled={!socket}
                  className="modern-button bg-red-800 dark:bg-red-700 text-white dark:text-white text-xs w-full clickable"
                  onClick={() => setShowResetModal(true)}
                >
                  Reset Game
                </button>
              </div>
            </div>

            {/* Empty Cards display */}
            <div className="md:w-3/4 lg:w-4/5 flex flex-col h-full">
              <h2 className="text-sm font-bold mb-2 pl-1">Submitted Cards</h2>
              
              <div className="h-full">
                <div className="flex flex-col items-center justify-center h-full bg-gray-50 dark:bg-gray-900 p-8 rounded-lg text-center">
                  <h3 className="text-xl font-bold mb-2">Waiting for Teams to Join</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Teams need to join the game from the lobby page before the game can begin.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Handle the case where a user is viewing the results page without selecting a team
  const viewOnlyMode = !teamName || !gameState.teams[teamName];

  // Sort teams by score (highest first)
  const sortedTeams = Object.entries(gameState.teams || {})
    .sort(([, teamA], [, teamB]) => teamB.score - teamA.score);

  // Count of all player teams
  const playerTeamsCount = Object.keys(gameState?.teams || {}).length;
  
  // Get list of voters for each card
  const getVotersForCard = (cardIndex: number) => {
    return Object.entries(gameState.votes || {})
      .filter(([_, votedIndex]) => votedIndex === cardIndex)
      .map(([voterTeam]) => voterTeam);
  };

  // Get team color based on team index - only count player teams for coloring
  const getTeamColor = (teamId: string): string => {
    const playerTeams = Object.keys(gameState?.teams || {}).filter(id => true);
    const teamIndex = playerTeams.indexOf(teamId);
    return teamIndex >= 0 ? TEAM_COLORS[teamIndex % TEAM_COLORS.length] : 'bg-gray-200';
  };

  // Get team text color based on team index - only count player teams for coloring
  const getTeamTextColor = (teamId: string): string => {
    const playerTeams = Object.keys(gameState?.teams || {}).filter(id => true);
    const teamIndex = playerTeams.indexOf(teamId);
    return teamIndex >= 0 ? TEAM_TEXT_COLORS[teamIndex % TEAM_TEXT_COLORS.length] : 'text-gray-800';
  };

  // Render a card in the results view
  const renderCard = (playedCard: any, index: number, isFull = false) => {
    const voters = getVotersForCard(index);
    const isCurrentTeamCard = playedCard.teamName === teamName;
    const isStorytellerCard = playedCard.teamName === gameState.storytellerTeam;
    const isWinner = voters.length > 0 && 
      getVotersForCard(index).length === Math.max(...(gameState.playedCards || []).map((_, i) => getVotersForCard(i).length));
    
    const teamColor = getTeamColor(playedCard.teamName);
    const teamTextColor = getTeamTextColor(playedCard.teamName);
    
    return (
      <div 
        key={index} 
        className={isFull ? "relative w-full h-auto" : "relative p-1 w-full max-w-[150px] h-auto mx-auto"}
        onClick={() => setCurrentCardIndex(index)}
      >
        <div className="overflow-hidden">
          <div className={`${teamColor} ${teamTextColor} py-0.5 px-1 text-center font-medium text-xs truncate flex items-center justify-center`}>
            <span className="truncate max-w-[120px]" title={playedCard.teamName}>
              {playedCard.teamName.length > 10 ? `${playedCard.teamName.substring(0, 10)}...` : playedCard.teamName}
            </span>
            {isStorytellerCard && <span className="ml-1 flex-shrink-0">★</span>}
          </div>
          <div className="aspect-[732/1064] bg-white dark:bg-black flex items-center justify-center overflow-hidden">
            <Image
              src={`/cards/${playedCard.card}`}
              alt={`Card from team ${playedCard.teamName}`}
              width={isFull ? 260 : 140}
              height={isFull ? 380 : 204}
              className="w-full h-full object-cover"
              priority={isStorytellerCard}
              style={{
                display: 'block',
                margin: 'auto'
              }}
            />
          </div>
          <div className={`${teamColor} ${teamTextColor} py-0.5 px-1 text-center font-medium text-xs`}>
            {voters.length} {voters.length === 1 ? 'vote' : 'votes'}
            {isWinner && voters.length > 0 && <span className="ml-1">★</span>}
          </div>
        </div>
        
        {/* Voter color blocks below card */}
        <div className="mt-1 grid grid-cols-6 gap-x-0.5 gap-y-0.5 w-full">
          {voters.map((voter, index) => (
            <div 
              key={`${voter}-${index}`} 
              className={`h-3 w-full ${getTeamColor(voter)}`} 
              title={voter}
            />
          ))}
        </div>
      </div>
    );
  };
  
  // Calculate how many teams guessed the storyteller's card
  const storytellerCardIndex = gameState.playedCards ? gameState.playedCards.findIndex(card => 
    card.teamName === gameState.storytellerTeam
  ) : -1;
  
  const votesForStoryteller = storytellerCardIndex !== -1 ? 
    getVotersForCard(storytellerCardIndex).length : 0;
  
  const totalTeams = Object.keys(gameState?.teams || {}).length;
  const everyoneFoundStoryteller = votesForStoryteller === totalTeams - 1;
  const nobodyFoundStoryteller = votesForStoryteller === 0;
  
  // Show desktop-only message for mobile users
  if (isMobile) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-4">
          <rect x="4" y="3" width="16" height="16" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="19" x2="12" y2="21" />
        </svg>
        <h1 className="text-2xl font-bold mb-4 text-center">Desktop Only</h1>
        <p className="text-center mb-6">
          The results page is designed for desktop viewing only. Please use a larger screen to view game results.
        </p>
      </div>
    );
  }
  
  return (
    <main className="flex flex-col h-full no-scroll results-page">
      <div className="w-full mx-auto flex flex-col p-4 pb-4 h-full">
        {/* Header */}
        <div className="mb-2 flex items-center justify-between">
          <div className="status-badge bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
            Results - Round {gameState.roundNumber || 'N/A'}
          </div>
          {gameState.storytellerTeam && (
            <div className={`status-badge ${getTeamColor(gameState.storytellerTeam)} ${getTeamTextColor(gameState.storytellerTeam)}`}>
              Storyteller:&nbsp;<span className="truncate inline-block max-w-[220px] align-bottom" title={gameState.storytellerTeam}>
                {gameState.storytellerTeam.length > 25 ? `${gameState.storytellerTeam.substring(0, 25)}...` : gameState.storytellerTeam}
              </span>
            </div>
          )}
        </div>
        
        {/* Scoring explanation */}
        <div className="card p-2 mb-3 text-xs">
          {everyoneFoundStoryteller && (
            <p>Everyone found the Storyteller's card! Storyteller gets 0 points, everyone else gets 2 points.</p>
          )}
          {nobodyFoundStoryteller && (
            <p>Nobody found the Storyteller's card! Storyteller gets 0 points, everyone else gets 2 points.</p>
          )}
          {!everyoneFoundStoryteller && !nobodyFoundStoryteller && (
            <p>Some players found the Storyteller's card. Storyteller gets 3 points, correct guessers get 3 points.</p>
          )}
          <p className="mt-1">Teams get 1 point for each vote their card received.</p>
        </div>
        
        {/* Main content */}
        <div className="flex flex-col md:flex-row gap-3 h-[calc(100%-100px)]">
          {/* Scoreboard */}
          <div className="md:w-1/4 lg:w-1/5 flex-shrink-0 card flex flex-col h-full">
            <h2 className="text-sm font-bold p-2 border-b">Scoreboard</h2>
            <div className="overflow-y-auto overflow-x-hidden custom-scrollbar flex-1">
              <table className="w-full table-fixed border-collapse">
                <thead className="sticky top-0 bg-gray-100 dark:bg-gray-800">
                  <tr>
                    <th className="py-1 px-2 text-left text-xs font-medium border-b w-[15%]">Rank</th>
                    <th className="py-1 px-2 text-left text-xs font-medium border-b w-[65%]">Team</th>
                    <th className="py-1 px-2 text-right text-xs font-medium border-b w-[20%]">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTeams.map(([teamId, team], index) => (
                    <tr key={teamId} className={`${getTeamColor(teamId)}`}>
                      <td className={`py-2 px-2 text-xs align-top ${getTeamTextColor(teamId)}`}>{index + 1}</td>
                      <td className={`py-2 px-2 text-xs font-medium break-words line-clamp-2 ${getTeamTextColor(teamId)}`} title={teamId}>
                        {teamId}
                      </td>
                      <td className={`py-2 px-2 text-xs text-right font-bold align-top ${getTeamTextColor(teamId)}`}>{team.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Control buttons */}
            <div className="p-2 border-t flex flex-col gap-2 mt-auto">
              <button
                disabled={!socket}
                className="modern-button text-xs w-full clickable"
                onClick={handleNextRound}
              >
                {!gameState || gameState.currentPhase === 'lobby' ? 'Start Game' : 'Next Round'}
              </button>
              
              <button
                disabled={!socket}
                className="modern-button bg-red-800 dark:bg-red-700 text-white dark:text-white text-xs w-full clickable"
                onClick={() => setShowResetModal(true)}
              >
                Reset Game
              </button>
            </div>
          </div>

          {/* Cards display */}
          <div className="md:w-3/4 lg:w-4/5 flex flex-col h-full">
            <h2 className="text-sm font-bold mb-2 pl-1">Submitted Cards</h2>
            
            <div className="h-full">
              {/* Show lobby state when in lobby phase */}
              {gameState.currentPhase === 'lobby' && (
                <div className="flex flex-col items-center justify-center h-full bg-gray-50 dark:bg-gray-900 p-8 rounded-lg text-center">
                  <h3 className="text-xl font-bold mb-2">Waiting for Teams to Join</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Teams need to join the game from the lobby page before the game can begin.
                  </p>
                </div>
              )}
              
              {/* Show waiting state when no cards are submitted yet */}
              {gameState.currentPhase !== 'lobby' && (!gameState.playedCards || gameState.playedCards.length === 0 || gameState.playedCards.length < playerTeamsCount) && gameState.currentPhase !== 'results' && (
                <div className="flex flex-col items-center justify-center h-full bg-gray-50 dark:bg-gray-900 p-8 rounded-lg text-center">
                  <div className="w-20 h-20 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin mb-6"></div>
                  <h3 className="text-xl font-bold mb-2">Waiting for Teams to Submit Cards</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">Teams are selecting their cards that match the storyteller's clue.</p>
                  <div className="flex flex-col gap-2 max-w-md w-full mx-auto">
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Submitted: {gameState.playedCards ? gameState.playedCards.length : 0} / {playerTeamsCount}
                    </p>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500"
                        style={{ 
                          width: `${gameState.playedCards ? 
                            Math.round((gameState.playedCards.length / playerTeamsCount) * 100) : 0}%` 
                        }}
                      ></div>
                    </div>
                    {gameState.playedCards && gameState.playedCards.length > 0 && (
                      <div className="mt-2 flex flex-wrap justify-center gap-2">
                        {Object.keys(gameState.teams).map(team => (
                          <div 
                            key={team} 
                            className={`px-2 py-1 text-xs ${
                              gameState.playedCards.some(card => card.teamName === team) 
                                ? `${getTeamColor(team)} ${getTeamTextColor(team)}` 
                                : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                            }`}
                          >
                            {gameState.playedCards.some(card => card.teamName === team) 
                              ? `${team} ✓` 
                              : team
                            }
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Show waiting state when cards are submitted but voting is in progress */}
              {gameState.currentPhase === 'vote' &&
                gameState.playedCards && 
                gameState.playedCards.length >= playerTeamsCount &&
                playerTeamsCount > 1 &&
                (!gameState.votes || Object.keys(gameState.votes).length < playerTeamsCount - 1) && (
                <div className="flex flex-col items-center justify-center h-full bg-gray-50 dark:bg-gray-900 p-8 rounded-lg text-center">
                  <div className="w-20 h-20 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin mb-6"></div>
                  <h3 className="text-xl font-bold mb-2">Waiting for Teams to Vote</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Teams are voting for which card they think belongs to <span className={`${getTeamColor(gameState.storytellerTeam)} ${getTeamTextColor(gameState.storytellerTeam)} px-1.5 py-0.5`}>{gameState.storytellerTeam}</span>
                  </p>
                  <div className="flex flex-col gap-2 max-w-md w-full mx-auto">
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Voted: {gameState.votes ? Object.keys(gameState.votes).length : 0} / {playerTeamsCount - 1}
                    </p>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500"
                        style={{ 
                          width: `${Math.round(((gameState.votes ? Object.keys(gameState.votes).length : 0) / 
                            (playerTeamsCount - 1)) * 100)}%` 
                        }}
                      ></div>
                    </div>
                    <div className="mt-2 flex flex-wrap justify-center gap-2">
                      {Object.keys(gameState.teams)
                        .filter(team => team !== gameState.storytellerTeam) // Skip storyteller
                        .map(team => (
                          <div 
                            key={team} 
                            className={`px-2 py-1 text-xs ${
                              gameState.votes && Object.prototype.hasOwnProperty.call(gameState.votes, team)
                                ? `${getTeamColor(team)} ${getTeamTextColor(team)}` 
                                : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                            }`}
                          >
                            {gameState.votes && Object.prototype.hasOwnProperty.call(gameState.votes, team)
                              ? `${team} ✓` 
                              : team
                            }
                          </div>
                        ))
                      }
                    </div>
                  </div>
                </div>
              )}
              
              {/* Show results when all voting is complete or when there's only one player team (no voting needed) */}
              {((gameState.currentPhase === 'results') || 
                (playerTeamsCount <= 1 && gameState.playedCards?.length >= playerTeamsCount) ||
                (gameState.currentPhase === 'vote' && 
                 gameState.votes && 
                 Object.keys(gameState.votes).length >= playerTeamsCount - 1 && 
                 playerTeamsCount > 1)) && 
               gameState.playedCards && gameState.playedCards.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6 gap-2 w-full h-full px-0 overflow-y-auto">
                  {gameState.playedCards.map((card, index) => renderCard(card, index))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Reset confirmation modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card p-4 max-w-md mx-auto">
            <h3 className="text-lg font-bold mb-2">Reset Game?</h3>
            <p className="mb-4 text-sm">This will remove all teams, reset all scores, and start a completely new game. This action cannot be undone.</p>
            <div className="flex gap-2 justify-end">
              <button 
                onClick={() => setShowResetModal(false)}
                className="py-1 px-3 border border-gray-300 dark:border-gray-600 text-sm clickable"
              >
                Cancel
              </button>
              <button
                onClick={handleResetGame}
                className="modern-button bg-red-800 dark:bg-red-700 text-white dark:text-white text-sm clickable"
              >
                Reset Game
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
} 
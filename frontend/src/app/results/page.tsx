'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSocket } from '@/context/SocketContext';

export default function ResultsPage() {
  const { socket, gameState, teamName, isLoading } = useSocket();
  const [showResetModal, setShowResetModal] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to lobby if no team name
    if (!teamName && !isLoading) {
      router.push('/');
    }
    
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [teamName, isLoading, router]);

  const handleNextRound = () => {
    if (!socket) return;
    socket.emit('nextRound');
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

  // Sort teams by score (highest first)
  const sortedTeams = Object.entries(gameState.teams)
    .sort(([, teamA], [, teamB]) => teamB.score - teamA.score);
  
  // Get list of voters for each card
  const getVotersForCard = (cardIndex: number) => {
    return Object.entries(gameState.votes)
      .filter(([_, votedIndex]) => votedIndex === cardIndex)
      .map(([voterTeam]) => voterTeam);
  };

  // Render a card with its voters
  const renderCard = (playedCard: any, index: number, isFull = false) => {
    const voters = getVotersForCard(index);
    const isCurrentTeamCard = playedCard.teamName === teamName;
    const isStorytellerCard = playedCard.teamName === gameState.storytellerTeam;
    const isWinner = voters.length > 0 && 
      getVotersForCard(index).length === Math.max(...gameState.playedCards.map((_, i) => getVotersForCard(i).length));
    
    return (
      <div 
        key={index} 
        className={`relative p-1 w-full max-w-[160px] h-auto mx-auto ${
          isWinner ? 'selected-card' : ''
        }`}
      >
        <div className={`game-card bg-gray-100 dark:bg-gray-800`}>
          <div className={`bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 py-1 px-2 text-center font-medium text-xs truncate flex items-center justify-center`}>
            {playedCard.teamName}
            {isStorytellerCard && <span className="ml-1">★</span>}
          </div>
          <div className="aspect-[732/1064] bg-white dark:bg-black flex items-center justify-center overflow-hidden">
            <Image
              src={`/cards/${playedCard.card}`}
              alt={`Card from team ${playedCard.teamName}`}
              width={isFull ? 160 : 140}
              height={isFull ? 233 : 204}
              className="w-full h-full object-cover"
              priority={isStorytellerCard}
              style={{
                display: 'block',
                margin: 'auto'
              }}
            />
          </div>
          <div className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 py-1 px-2 text-center text-xs">
            {voters.length} {voters.length === 1 ? 'vote' : 'votes'}
            {isWinner && voters.length > 0 && <span className="ml-1">★</span>}
          </div>
        </div>
        
        {/* Voter pills below card */}
        <div className="mt-2 mb-2 flex flex-wrap justify-center gap-1 min-h-[30px]">
          {voters.length > 0 ? (
            voters.map(voter => (
              <span 
                key={voter} 
                className="text-xs px-2 py-0.5 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 truncate max-w-full"
                title={voter}
              >
                {voter}
              </span>
            ))
          ) : (
            <span className="text-xs text-gray-400">No votes</span>
          )}
        </div>
      </div>
    );
  };
  
  // Calculate how many teams guessed the storyteller's card
  const storytellerCardIndex = gameState.playedCards.findIndex(card => 
    card.teamName === gameState.storytellerTeam
  );
  
  const votesForStoryteller = storytellerCardIndex !== -1 ? 
    getVotersForCard(storytellerCardIndex).length : 0;
  
  const totalTeams = Object.keys(gameState.teams).length;
  const everyoneFoundStoryteller = votesForStoryteller === totalTeams - 1;
  const nobodyFoundStoryteller = votesForStoryteller === 0;
  
  return (
    <main className="flex flex-col h-full no-scroll">
      <div className="w-full mx-auto flex flex-col p-4 pb-4 h-full">
        {/* Header */}
        <div className="mb-2 flex items-center justify-between">
          <div className="status-badge bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
            Results - Round {gameState.roundNumber}
          </div>
          <div className="status-badge bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
            Storyteller: {gameState.storytellerTeam}
          </div>
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
        <div className="flex flex-col md:flex-row gap-2 h-[calc(100%-100px)]">
          {/* Scoreboard */}
          <div className="md:w-1/4 lg:w-1/5 flex-shrink-0 card flex flex-col h-full">
            <h2 className="text-sm font-bold p-2 border-b">Scoreboard</h2>
            <div className="overflow-y-auto custom-scrollbar flex-1">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-gray-100 dark:bg-gray-800">
                  <tr>
                    <th className="py-1 px-2 text-left text-xs font-medium border-b">Rank</th>
                    <th className="py-1 px-2 text-left text-xs font-medium border-b">Team</th>
                    <th className="py-1 px-2 text-right text-xs font-medium border-b">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTeams.map(([teamId, team], index) => (
                    <tr key={teamId}>
                      <td className="py-1 px-2 text-xs">{index + 1}</td>
                      <td className="py-1 px-2 text-xs font-medium">{teamId}</td>
                      <td className="py-1 px-2 text-xs text-right font-bold">{team.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Control buttons */}
            <div className="p-2 border-t flex flex-col gap-2 mt-auto">
              <button
                onClick={handleNextRound}
                className="modern-button text-xs w-full clickable"
              >
                Next Round
              </button>
              
              <button
                onClick={() => setShowResetModal(true)}
                className="modern-button bg-red-800 dark:bg-red-700 text-white dark:text-white text-xs w-full clickable"
              >
                Reset Game
              </button>
            </div>
          </div>

          {/* Cards display */}
          <div className="md:w-3/4 lg:w-4/5 flex flex-col h-full">
            <h2 className="text-sm font-bold mb-2 pl-1">Submitted Cards</h2>
            
            <div className="h-full">
              {isMobile ? (
                // Mobile carousel view
                <div className="relative flex flex-col items-center h-full">
                  {gameState.playedCards.length > 0 && (
                    <>
                      <div className="flex items-center justify-between w-full mb-2">
                        <button 
                          onClick={prevCard}
                          className="w-8 h-8 flex items-center justify-center card clickable"
                          aria-label="Previous card"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 18l-6-6 6-6" />
                          </svg>
                        </button>
                        <span className="text-xs font-medium">
                          {currentCardIndex + 1} / {gameState.playedCards.length}
                        </span>
                        <button 
                          onClick={nextCard}
                          className="w-8 h-8 flex items-center justify-center card clickable"
                          aria-label="Next card"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 18l6-6-6-6" />
                          </svg>
                        </button>
                      </div>
                      <div className="flex items-center justify-center flex-1 w-full">
                        {renderCard(gameState.playedCards[currentCardIndex], currentCardIndex, true)}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                // Desktop grid view
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 gap-y-5 w-full pb-2 h-full">
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
            <p className="mb-4 text-sm">This will reset all scores and start a new game. This action cannot be undone.</p>
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
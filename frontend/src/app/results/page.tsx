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
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <h1 className="mb-8 text-4xl font-bold text-center">Loading...</h1>
      </div>
    );
  }

  // If team not found
  if (!gameState.teams[teamName]) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
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
        className={`relative rounded-lg overflow-hidden p-1 w-full max-w-[160px] h-auto mx-auto
          ${isWinner ? 'ring-2 ring-yellow-500' : ''} 
          ${isStorytellerCard ? 'ring-2 ring-purple-500' : ''}
          ${isCurrentTeamCard ? 'border-blue-500' : 'border-gray-300'}`}
      >
        <div className={`${isCurrentTeamCard ? 'bg-blue-600' : isStorytellerCard ? 'bg-purple-600' : 'bg-gray-700'} text-white py-1 px-2 text-center font-medium text-sm truncate flex items-center justify-center rounded-t-lg`}>
          {playedCard.teamName}
          {isStorytellerCard && <span className="ml-1">👑</span>}
        </div>
        <div className="aspect-[732/1064] bg-gray-200 flex items-center justify-center overflow-hidden">
          <Image
            src={`/cards/${playedCard.card}`}
            alt={`Card from team ${playedCard.teamName}`}
            width={isFull ? 160 : 140}
            height={isFull ? 233 : 204}
            className="w-full h-auto object-contain"
            priority={isStorytellerCard}
            style={{
              display: 'block',
              margin: 'auto',
              maxHeight: '100%',
              maxWidth: '100%'
            }}
          />
        </div>
        <div className="bg-black/70 text-white py-1 px-2 text-center text-sm">
          {voters.length} {voters.length === 1 ? 'vote' : 'votes'}
          {isWinner && voters.length > 0 && <span className="ml-1 text-yellow-400">🏆</span>}
        </div>
        
        {/* Voter pills below card - always present for consistency */}
        <div className="mt-1 p-2 bg-gray-100 rounded text-center min-h-[36px] flex flex-col justify-center">
          {voters.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-1">
              {voters.map(voter => (
                <span 
                  key={voter} 
                  className="text-xs px-2 py-0.5 bg-blue-500 text-white rounded-full truncate max-w-full"
                  title={voter}
                >
                  {voter}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400">No votes</p>
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
    <main className="flex min-h-screen flex-col items-center p-2 sm:p-4 overflow-hidden">
      <div className="w-full max-w-[1600px] flex-1 flex flex-col h-screen overflow-hidden px-2">
        {/* More compact header especially on mobile */}
        <div className="mb-2 flex flex-col md:flex-row md:justify-between md:items-center">
          <h1 className="text-xl md:text-2xl font-bold">Results - Round {gameState.roundNumber}</h1>
          <div className="text-sm md:text-base">
            <span className="font-semibold">Storyteller:</span> {gameState.storytellerTeam}
          </div>
        </div>
        
        {/* Scoring explanation - more compact on mobile */}
        <div className="bg-blue-50 p-2 md:p-3 rounded-lg mb-2 md:mb-4 text-xs">
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
        
        {/* Main content - two column layout */}
        <div className="flex-1 flex flex-col md:flex-row gap-3 md:gap-4 min-h-0 overflow-hidden">
          {/* Scoreboard - Left side on larger screens */}
          <div className="md:w-1/4 lg:w-1/5 flex-shrink-0 bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
            <h2 className="text-sm md:text-base font-bold p-2 border-b bg-gray-50">Scoreboard</h2>
            <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 280px)" }}>
              <table className="w-full border-collapse">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="py-1 md:py-2 px-2 md:px-3 text-left text-xs md:text-sm font-medium border-b">Rank</th>
                    <th className="py-1 md:py-2 px-2 md:px-3 text-left text-xs md:text-sm font-medium border-b">Team</th>
                    <th className="py-1 md:py-2 px-2 md:px-3 text-right text-xs md:text-sm font-medium border-b">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTeams.map(([teamId, team], index) => (
                    <tr key={teamId} className={`${teamId === teamName ? 'bg-blue-50' : index % 2 === 0 ? 'bg-gray-50' : ''}`}>
                      <td className="py-1 md:py-2 px-2 md:px-3 text-xs md:text-sm">{index + 1}</td>
                      <td className="py-1 md:py-2 px-2 md:px-3 text-xs md:text-sm font-medium">{teamId}</td>
                      <td className="py-1 md:py-2 px-2 md:px-3 text-xs md:text-sm text-right font-bold">{team.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Buttons moved under scoreboard */}
            <div className="mt-auto p-2 md:p-3 border-t flex flex-col gap-2">
              <button
                onClick={handleNextRound}
                className="py-1 md:py-2 px-4 bg-blue-600 text-white text-xs md:text-sm font-medium rounded-md hover:bg-blue-700 cursor-pointer w-full"
              >
                Next Round
              </button>
              
              <button
                onClick={() => setShowResetModal(true)}
                className="py-1 md:py-2 px-4 bg-red-600 text-white text-xs md:text-sm font-medium rounded-md hover:bg-red-700 cursor-pointer w-full"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Cards - Right side on larger screens */}
          <div className="md:w-3/4 lg:w-4/5 flex-1 flex flex-col min-h-0 overflow-hidden">
            <h2 className="text-sm md:text-base font-bold mb-2 md:mb-3 pl-1">Submitted Cards</h2>
            
            <div className="flex-1 pt-0 pb-1 px-1">
              {isMobile ? (
                // Mobile carousel view - more compact
                <div className="relative flex flex-col items-center">
                  {gameState.playedCards.length > 0 && (
                    <>
                      <div className="flex items-center justify-between w-full mb-2">
                        <button 
                          onClick={prevCard}
                          className="bg-gray-200 hover:bg-gray-300 w-10 h-10 flex items-center justify-center rounded-full shadow-sm transition-colors cursor-pointer"
                          aria-label="Previous card"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 18l-6-6 6-6" />
                          </svg>
                        </button>
                        <span className="text-sm font-medium">
                          {currentCardIndex + 1} / {gameState.playedCards.length}
                        </span>
                        <button 
                          onClick={nextCard}
                          className="bg-gray-200 hover:bg-gray-300 w-10 h-10 flex items-center justify-center rounded-full shadow-sm transition-colors cursor-pointer"
                          aria-label="Next card"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 18l6-6-6-6" />
                          </svg>
                        </button>
                      </div>
                      <div className="w-full max-w-[160px] mx-auto">
                        {renderCard(gameState.playedCards[currentCardIndex], currentCardIndex, true)}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                // Desktop responsive grid
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6 gap-3 mx-auto w-full place-items-center">
                  {gameState.playedCards.map((playedCard, index) => renderCard(playedCard, index, false))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Reset Game Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h2 className="text-xl font-bold mb-3">Reset Game?</h2>
            <p className="mb-4 text-sm">
              This will reset all scores and start a new game. All teams will remain connected.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="py-2 px-4 text-sm border border-gray-300 rounded-md hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleResetGame}
                className="py-2 px-4 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 cursor-pointer"
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
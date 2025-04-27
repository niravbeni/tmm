'use client';

import { useState, useEffect, useRef, TouchEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
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

export default function HandPage() {
  const { socket, gameState, teamName, isLoading } = useSocket();
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const onTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      nextCard();
    }
    if (isRightSwipe) {
      prevCard();
    }
  };

  useEffect(() => {
    // Redirect to lobby if no team name
    if (!teamName && !isLoading) {
      router.push('/');
    }
    
    // Check if this team has already submitted a card
    if (gameState && gameState.playedCards && gameState.playedCards.some(pc => pc.teamName === teamName)) {
      setHasSubmitted(true);
    } else {
      setHasSubmitted(false);
    }
    
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [teamName, isLoading, router, gameState]);

  const handleSubmitCard = () => {
    if (selectedCard === null || !socket) return;
    
    // Emit without any animations or transitions
    socket.emit('submitCard', {
      teamName,
      cardIndex: selectedCard,
    });
    
    // Use replace to prevent animation and history stacking
    router.replace('/waiting');
  };
  
  const nextCard = () => {
    if (!gameState?.teams[teamName]?.hand) return;
    setCurrentCardIndex((prev) => 
      prev === gameState.teams[teamName].hand.length - 1 ? 0 : prev + 1
    );
    setSelectedCard(currentCardIndex + 1 === gameState.teams[teamName].hand.length ? 0 : currentCardIndex + 1);
  };
  
  const prevCard = () => {
    if (!gameState?.teams[teamName]?.hand) return;
    setCurrentCardIndex((prev) => 
      prev === 0 ? gameState.teams[teamName].hand.length - 1 : prev - 1
    );
    setSelectedCard(currentCardIndex === 0 ? gameState.teams[teamName].hand.length - 1 : currentCardIndex - 1);
  };
  
  if (isLoading || !gameState) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="animate-pulse text-2xl font-medium">Loading...</div>
      </div>
    );
  }

  // If team not found or no hand
  if (!gameState.teams[teamName] || !gameState.teams[teamName].hand) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <h1 className="mb-6 text-2xl font-bold text-center">Team not found</h1>
        <button
          onClick={() => router.push('/')}
          className="modern-button"
        >
          Return to Lobby
        </button>
      </div>
    );
  }

  // Check if user is facilitator/host

  const team = gameState.teams[teamName];
  
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
  
  // Render a card from the player's hand
  const renderHandCard = (card: string, index: number) => {
    return (
      <div
        key={card}
        className="relative cursor-pointer p-2 md:p-3 clickable"
        onClick={() => setSelectedCard(index)}
      >
        <div 
          className={`game-card bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden ${
            selectedCard === index ? 'md:selected-card' : ''
          }`}
          style={{
            border: !isMobile && selectedCard === index ? '2px solid #000000' : 'none',
            boxSizing: 'border-box'
          }}
        >
          <Image
            src={`/cards/${card}`}
            alt={`Card ${index + 1}`}
            width={isMobile ? 140 : 120}
            height={isMobile ? 204 : 175}
            className="w-full h-full object-cover"
            style={{
              display: 'block',
              margin: 'auto'
            }}
          />
        </div>
      </div>
    );
  };
  
  const renderSelectedCard = (card: string) => {
    return (
      <div className="relative overflow-hidden w-full h-full">
        <div className="game-card bg-gray-100 dark:bg-gray-800 flex items-center justify-center h-full w-full">
          <Image
            src={`/cards/${card}`}
            alt="Selected card"
            fill
            priority
            sizes="(max-width: 768px) 85vw, 70vw"
            className="object-contain"
            style={{
              display: 'block'
            }}
          />
        </div>
      </div>
    );
  };
  
  return (
    <main className="flex flex-col h-full no-scroll hand-page">
      <div className="w-full mx-auto flex flex-col justify-between p-4 h-full">
        {/* Header */}
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2 flex-shrink min-w-0">
            <div className={`status-badge ${getTeamColor(teamName)} ${getTeamTextColor(teamName)} truncate max-w-[180px] sm:max-w-[220px] md:max-w-[280px]`} title={teamName}>
              {teamName.length > 20 ? `${teamName.substring(0, 20)}...` : teamName}
            </div>
            {gameState.storytellerTeam === teamName && (
              <div className="status-badge bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 whitespace-nowrap">
                Storyteller
              </div>
            )}
          </div>
          <div className="flex-shrink-0">
            <div className="status-badge bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 whitespace-nowrap">
              Round {gameState.roundNumber}
            </div>
          </div>
        </div>
        
        {/* Instructions Section */}
        {gameState.storytellerTeam === teamName && (
          <div className="card p-2 md:p-3 mb-3 text-sm">
            <p>
              <span className="font-medium">As Storyteller: </span> Select a card and provide a clue to all players
            </p>
          </div>
        )}
        
        {hasSubmitted ? (
          <div className="card p-3 mb-3 text-center">
            <p className="text-sm md:text-base">
              {gameState.storytellerTeam === teamName 
                ? "You've submitted your card and provided a clue. Waiting for other teams..."
                : "You've submitted your card! Waiting for other teams..."}
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Instructions card for non-storytellers */}
            {gameState.storytellerTeam !== teamName && (
              <div className="card p-2 md:p-3 mb-3 text-sm">
                <p>
                  <span className="font-medium">Instructions:</span> Select a card that matches the clue from {gameState.storytellerTeam}
                </p>
              </div>
            )}
            
            <div className="flex-1 min-h-0">
              {isMobile ? (
                // Mobile view - improved responsive layout
                <div className="h-full flex flex-col">
                  {team.hand.length > 0 && (
                    <div className="flex flex-col h-full">
                      {/* Card display area - takes most of the space */}
                      <div 
                        ref={carouselRef}
                        className="flex-grow flex items-center justify-center"
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                      >
                        <div className="mobile-card-container">
                          {renderSelectedCard(team.hand[currentCardIndex])}
                        </div>
                      </div>
                      
                      {/* Card navigation controls - responsive sizing */}
                      <div className="flex items-center justify-between w-full py-3 mt-2">
                        <button 
                          onClick={prevCard}
                          className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center card clickable"
                          aria-label="Previous card"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 18l-6-6 6-6" />
                          </svg>
                        </button>
                        <span className="text-sm sm:text-base font-medium">
                          {currentCardIndex + 1} / {team.hand.length}
                        </span>
                        <button 
                          onClick={nextCard}
                          className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center card clickable"
                          aria-label="Next card"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 18l6-6-6-6" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Desktop grid layout
                <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2 mx-auto w-full place-items-center px-0">
                  {team.hand.map((card, index) => renderHandCard(card, index))}
                </div>
              )}
            </div>
            
            {/* Submit button - fixed at bottom */}
            {!hasSubmitted && (
              <div className="py-4 flex justify-center">
                <button
                  onClick={handleSubmitCard}
                  disabled={selectedCard === null || gameState.currentPhase === 'lobby'}
                  className={`modern-button w-full max-w-md ${
                    selectedCard === null || gameState.currentPhase === 'lobby' ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {gameState.currentPhase === 'lobby' ? 'Waiting for Game to Start' : 'Submit Card'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
} 
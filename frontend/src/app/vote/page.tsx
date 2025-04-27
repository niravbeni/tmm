'use client';

import { useState, useEffect, useRef, TouchEvent, useMemo } from 'react';
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

export default function VotePage() {
  const { socket, gameState, teamName, isLoading } = useSocket();
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [showOwnCardWarning, setShowOwnCardWarning] = useState(false);
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
    
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [teamName, isLoading, router]);

  // Shuffle the cards while keeping track of their original indices
  const shuffledCards = useMemo(() => {
    if (!gameState?.playedCards) return [];
    
    // Create an array of objects with the card data and its original index
    const indexedCards = gameState.playedCards.map((card, index) => ({
      card,
      originalIndex: index
    }));
    
    // Fisher-Yates shuffle algorithm
    for (let i = indexedCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indexedCards[i], indexedCards[j]] = [indexedCards[j], indexedCards[i]];
    }
    
    return indexedCards;
  }, [gameState?.playedCards]);
  
  const handleSubmitVote = () => {
    if (selectedCard === null || !socket || !gameState) return;
    
    // Don't allow voting if game hasn't been started yet
    if (gameState.currentPhase === 'lobby') {
      return;
    }
    
    // Don't allow voting if you're the storyteller
    if (isStoryteller) {
      return; // This is already handled in the UI
    }
    
    // Don't allow voting for your own card if you're not the storyteller
    const originalIndex = shuffledCards[selectedCard]?.originalIndex;
    const isOwnCard = gameState.playedCards[originalIndex]?.teamName === teamName;
    
    if (isOwnCard) {
      setShowOwnCardWarning(true);
      return;
    }
    
    setShowOwnCardWarning(false);
    
    // Submit vote with the original index, not the shuffled index
    socket.emit('submitVote', {
      teamName,
      votedCardIndex: originalIndex,
    });
    
    // Use replace to prevent animation and history stacking
    router.replace('/waiting');
  };
  
  const nextCard = () => {
    if (!shuffledCards.length) return;
    setCurrentCardIndex((prev) => 
      prev === shuffledCards.length - 1 ? 0 : prev + 1
    );
    setSelectedCard(currentCardIndex + 1 === shuffledCards.length ? 0 : currentCardIndex + 1);
    setShowOwnCardWarning(false); // Clear warning when changing cards
  };
  
  const prevCard = () => {
    if (!shuffledCards.length) return;
    setCurrentCardIndex((prev) => 
      prev === 0 ? shuffledCards.length - 1 : prev - 1
    );
    setSelectedCard(currentCardIndex === 0 ? shuffledCards.length - 1 : currentCardIndex - 1);
    setShowOwnCardWarning(false); // Clear warning when changing cards
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
          className="modern-button"
        >
          Return to Lobby
        </button>
      </div>
    );
  }

  const hasVoted = gameState.votes && gameState.votes[teamName] !== undefined;
  const isStoryteller = gameState.storytellerTeam === teamName;
  
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
  
  // Render a card from the shuffled array
  const renderCard = (cardItem: any, shuffledIndex: number) => {
    const isSelected = selectedCard === shuffledIndex;
    const playedCard = cardItem.card;
    const isOwnCard = playedCard.teamName === teamName;
    
    if (isMobile) {
      return (
        <div className="relative overflow-hidden w-full h-full">
          <div 
            className={`game-card bg-gray-100 dark:bg-gray-800 flex items-center justify-center h-full w-full overflow-hidden ${
              isSelected ? 'border-2 border-black dark:border-white' : ''
            }`}
            onClick={() => {
              setSelectedCard(shuffledIndex);
              if (isOwnCard && !isStoryteller) {
                setShowOwnCardWarning(true);
              } else {
                setShowOwnCardWarning(false);
              }
            }}
          >
            <Image
              src={`/cards/${playedCard.card}`}
              alt={`Card option ${shuffledIndex + 1}`}
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
    }
    
    // Desktop version
    return (
      <div 
        key={shuffledIndex} 
        className="relative p-1 cursor-pointer clickable"
        onClick={() => {
          setSelectedCard(shuffledIndex);
          if (isOwnCard && !isStoryteller) {
            setShowOwnCardWarning(true);
          } else {
            setShowOwnCardWarning(false);
          }
        }}
      >
        <div 
          className={`game-card bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden ${
            isSelected ? 'selected-card' : ''
          }`}
          style={{
            border: isSelected ? '2px solid #000000' : 'none',
            boxSizing: 'border-box'
          }}
        >
          <Image
            src={`/cards/${playedCard.card}`}
            alt={`Card option ${shuffledIndex + 1}`}
            width={100}
            height={145}
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

  // Header component with team info and selected card indicator
  const renderHeader = () => (
    <div className="flex flex-wrap items-center justify-between mb-3">
      <div className="flex items-center gap-2 flex-shrink min-w-0">
        <div className={`status-badge ${getTeamColor(teamName)} ${getTeamTextColor(teamName)} truncate max-w-[180px] sm:max-w-[220px] md:max-w-[280px]`} title={teamName}>
          {teamName.length > 20 ? `${teamName.substring(0, 20)}...` : teamName}
        </div>
        {isStoryteller && (
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
  );
  
  // If already voted, show waiting screen
  if (hasVoted || isStoryteller) {
    return (
      <main className="flex flex-col h-full no-scroll hand-page">
        <div className="w-full mx-auto flex flex-col p-4 pb-4 h-full">
          <div className="flex flex-wrap items-center justify-between mb-3">
            <div className="flex items-center gap-2 flex-shrink min-w-0">
              <div className={`status-badge ${getTeamColor(teamName)} ${getTeamTextColor(teamName)} truncate max-w-[180px] sm:max-w-[220px] md:max-w-[280px]`} title={teamName}>
                {teamName.length > 20 ? `${teamName.substring(0, 20)}...` : teamName}
              </div>
              {isStoryteller && (
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
          
          <div className="flex flex-col items-center justify-center flex-1">
            <div className="mb-6 w-16 h-16 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin"></div>
            <h1 className="text-2xl font-bold mb-6 text-center">
              {isStoryteller ? "You're the Storyteller" : "Vote Submitted"}
            </h1>
            <p className="text-center max-w-md mb-6">
              {isStoryteller 
                ? "As the storyteller, you don't need to vote. Waiting for other teams to vote..." 
                : "Your vote has been submitted. Waiting for other teams to vote..."}
            </p>
          </div>
        </div>
      </main>
    );
  }
  
  return (
    <main className="flex flex-col h-full no-scroll vote-page">
      <div className="w-full mx-auto flex flex-col p-4 pb-4 h-full">
        {renderHeader()}
        
        <div className="card p-3 mb-3">
          <p className="text-center text-sm px-2 md:px-4 mb-0">
            Vote for the card you think belongs to <span className={`${getTeamColor(gameState.storytellerTeam)} ${getTeamTextColor(gameState.storytellerTeam)} px-1.5 py-0.5`}>{gameState.storytellerTeam}</span>
          </p>
        </div>
        
        {/* Warning when selecting own card */}
        {showOwnCardWarning && (
          <div className="card p-3 mb-3 bg-red-100 dark:bg-red-900">
            <p className="text-red-800 dark:text-red-200 text-center">
              You cannot vote for your own card! Please select another card.
            </p>
          </div>
        )}
        
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 min-h-0 overflow-y-auto">
            {isMobile ? (
              // Mobile view - carousel with swipe
              <div className="h-full flex flex-col">
                {shuffledCards.length > 0 && (
                  <div className="flex flex-col h-full">
                    {/* Card display area */}
                    <div 
                      ref={carouselRef}
                      className="flex-grow flex items-center justify-center"
                      onTouchStart={onTouchStart}
                      onTouchMove={onTouchMove}
                      onTouchEnd={onTouchEnd}
                    >
                      <div className="mobile-card-container">
                        {renderCard(shuffledCards[currentCardIndex], currentCardIndex)}
                      </div>
                    </div>
                    
                    {/* Card navigation controls */}
                    <div className="flex items-center justify-between w-full py-3 mt-2">
                      <button 
                        onClick={prevCard}
                        className="w-12 h-12 flex items-center justify-center card clickable"
                        aria-label="Previous card"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M15 18l-6-6 6-6" />
                        </svg>
                      </button>
                      <span className="text-base font-medium">
                        {currentCardIndex + 1} / {shuffledCards.length}
                      </span>
                      <button 
                        onClick={nextCard}
                        className="w-12 h-12 flex items-center justify-center card clickable"
                        aria-label="Next card"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Desktop grid layout
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6 gap-1 mx-auto w-full place-items-center px-0">
                {shuffledCards.map((cardItem, index) => renderCard(cardItem, index))}
              </div>
            )}
          </div>
          
          {/* Submit button - fixed at bottom */}
          <div className="py-4 flex justify-center mt-auto">
            <button
              onClick={handleSubmitVote}
              disabled={selectedCard === null || showOwnCardWarning || gameState.currentPhase === 'lobby'}
              className={`modern-button w-full max-w-md ${
                selectedCard === null || showOwnCardWarning || gameState.currentPhase === 'lobby' ? 'opacity-50 cursor-not-allowed' : 'clickable'
              }`}
            >
              {gameState.currentPhase === 'lobby' ? 'Waiting for Game to Start' : 'Submit Vote'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
} 
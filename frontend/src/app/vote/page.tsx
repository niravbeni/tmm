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

  const hasVoted = gameState.votes[teamName] !== undefined;
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
    
    return (
      <div 
        key={shuffledIndex} 
        className="relative p-2 md:p-3 cursor-pointer clickable"
        onClick={() => {
          setSelectedCard(shuffledIndex);
          // Show warning if it's the user's own card
          if (isOwnCard && !isStoryteller) {
            setShowOwnCardWarning(true);
          } else {
            setShowOwnCardWarning(false);
          }
        }}
      >
        <div 
          className={`game-card bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden ${
            isSelected ? 'md:selected-card' : ''
          }`}
          style={{
            border: !isMobile && isSelected ? '2px solid #000000' : 'none',
            boxSizing: 'border-box'
          }}
        >
          <Image
            src={`/cards/${playedCard.card}`}
            alt={`Card option ${shuffledIndex + 1}`}
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
  
  return (
    <main className="flex flex-col h-full no-scroll">
      <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="status-badge bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
            Vote
          </div>
          {teamName && (
            <div className={`status-badge ${getTeamColor(teamName)} ${getTeamTextColor(teamName)}`}>
              Team: {teamName}
            </div>
          )}
          {isStoryteller && (
            <div className={`ml-auto status-badge ${getTeamColor(teamName)} ${getTeamTextColor(teamName)}`}>
              Storyteller
            </div>
          )}
        </div>
        
        {hasVoted ? (
          <div className="card p-3 mb-3 text-center">
            <p className="text-sm md:text-base">
              Your vote has been submitted! Waiting for other teams to vote...
            </p>
          </div>
        ) : isStoryteller ? (
          <div className="card p-3 mb-3 text-center">
            <p className="text-sm md:text-base">
              As the Storyteller, you don't vote in this round. Watch as other teams try to identify your card!
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            <div className="card p-2 md:p-3 mb-3 text-sm">
              <p>
                <span className="font-medium">Instructions:</span> Vote for the card you think was submitted by the storyteller: <span className={`font-medium ${getTeamTextColor(gameState.storytellerTeam)}`}>{gameState.storytellerTeam}</span>
              </p>
              
              {/* Warning message for own card selection */}
              {showOwnCardWarning && (
                <div className="mt-2 p-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-sm">
                  <p className="text-xs">You can't vote for your own card! Please select a different card.</p>
                </div>
              )}
            </div>
            
            <div className="flex-1">
              {isMobile ? (
                // Mobile carousel view
                <div className="relative flex flex-col items-center h-full min-h-0">
                  {shuffledCards.length > 0 && (
                    <>
                      <div className="flex items-center justify-between w-full mb-3">
                        <button 
                          onClick={prevCard}
                          className="w-10 h-10 flex items-center justify-center card clickable"
                          aria-label="Previous card"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 18l-6-6 6-6" />
                          </svg>
                        </button>
                        <span className="text-sm font-medium flex items-center">
                          {currentCardIndex + 1} / {shuffledCards.length}
                        </span>
                        <button 
                          onClick={nextCard}
                          className="w-10 h-10 flex items-center justify-center card clickable"
                          aria-label="Next card"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 18l6-6-6-6" />
                          </svg>
                        </button>
                      </div>
                      <div 
                        ref={carouselRef}
                        className="w-full max-w-[70vw] h-[50vh] flex items-center justify-center mt-4"
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                      >
                        {renderCard(shuffledCards[currentCardIndex], currentCardIndex)}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                // Desktop grid - more compact
                <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2 mx-auto w-full place-items-center">
                  {shuffledCards.map((cardItem, index) => renderCard(cardItem, index))}
                </div>
              )}
            </div>
            
            {!hasVoted && !isStoryteller && (
              <div className="mt-auto py-4 flex justify-center">
                <button
                  onClick={handleSubmitVote}
                  disabled={selectedCard === null || showOwnCardWarning}
                  className={`modern-button ${
                    (selectedCard === null || showOwnCardWarning) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Submit Vote
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
} 
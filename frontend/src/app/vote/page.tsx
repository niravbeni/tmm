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
  
  // Shuffle the cards while keeping track of their original indices and filter out own card
  const shuffledCards = useMemo(() => {
    if (!gameState?.playedCards) return [];
    
    // Create an array of objects with the card data and its original index
    const indexedCards = gameState.playedCards
      // Filter out the user's own card
      .filter(card => card.teamName !== teamName)
      .map((card, index) => {
        // Find the original index in the full array
        const originalIndex = gameState.playedCards.findIndex(c => 
          c.teamName === card.teamName && c.card === card.card
        );
        return {
          card,
          originalIndex
        };
      });
    
    // Fisher-Yates shuffle algorithm
    for (let i = indexedCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indexedCards[i], indexedCards[j]] = [indexedCards[j], indexedCards[i]];
    }
    
    return indexedCards;
  }, [gameState?.playedCards, teamName]);
  
  useEffect(() => {
    // Redirect to lobby if no team name
    if (!teamName && !isLoading) {
      router.push('/');
    }
    
    // Check if device is mobile
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // If on mobile and we have cards, automatically select the first card
      if (mobile && shuffledCards.length > 0 && selectedCard === null) {
        setSelectedCard(0);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [teamName, isLoading, router, shuffledCards, selectedCard]);
  
  // Pre-select the first card once cards are loaded on mobile
  useEffect(() => {
    if (isMobile && shuffledCards.length > 0 && selectedCard === null) {
      setSelectedCard(0);
    }
  }, [isMobile, shuffledCards, selectedCard]);
  
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
    
    // Get the original index of the selected card
    const originalIndex = shuffledCards[selectedCard]?.originalIndex;
    
    // Calculate if this will be the last vote submission
    const votingTeams = Object.keys(gameState.teams).filter(team => team !== gameState.storytellerTeam);
    const currentVotesCount = gameState.votes ? Object.keys(gameState.votes).length : 0;
    const willBeLastVote = currentVotesCount + 1 >= votingTeams.length;
    
    console.log(`Submitting vote: ${currentVotesCount + 1}/${votingTeams.length} votes`);
    
    // Submit vote with the original index, not the shuffled index
    socket.emit('submitVote', {
      teamName,
      votedCardIndex: originalIndex,
    });
    
    // Immediately navigate if not the last vote
    if (!willBeLastVote) {
      router.replace('/waiting');
    }
    // Otherwise, don't navigate and let the socket event handle it
  };
  
  const nextCard = () => {
    if (!shuffledCards.length) return;
    setCurrentCardIndex((prev) => 
      prev === shuffledCards.length - 1 ? 0 : prev + 1
    );
    setSelectedCard(currentCardIndex + 1 === shuffledCards.length ? 0 : currentCardIndex + 1);
  };
  
  const prevCard = () => {
    if (!shuffledCards.length) return;
    setCurrentCardIndex((prev) => 
      prev === 0 ? shuffledCards.length - 1 : prev - 1
    );
    setSelectedCard(currentCardIndex === 0 ? shuffledCards.length - 1 : currentCardIndex - 1);
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
                display: 'block',
                maxHeight: '100%',
                maxWidth: '100%'
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
            width={170}
            height={250}
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
  
  return (
    <main className="flex flex-col h-full no-scroll vote-page">
      <div className="w-full mx-auto flex flex-col p-4 pb-4 h-full">
        {renderHeader()}
        
        <div className="card p-3 mb-3">
          <p className="text-center text-sm px-2 md:px-4 mb-0">
            {isStoryteller 
              ? "As the storyteller, you don't need to vote. Other teams will vote for your card."
              : `Vote for the card you think belongs to ${gameState.storytellerTeam} (Your card is not shown)`
            }
          </p>
        </div>
        
        {/* If storyteller or already voted, show waiting indicator instead of cards */}
        {(hasVoted || isStoryteller) ? (
          <div className="flex-1 overflow-hidden flex flex-col items-center justify-center">
            <div className="mb-4 w-16 h-16 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin"></div>
            <p className="text-center max-w-md">
              Waiting for other teams to vote...
            </p>
          </div>
        ) : (
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
                        className="flex-grow flex items-center justify-center overflow-hidden"
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                      >
                        <div className="mobile-card-container">
                          {renderCard(shuffledCards[currentCardIndex], currentCardIndex)}
                        </div>
                      </div>
                      
                      {/* Card navigation controls */}
                      <div className="flex items-center justify-between w-full py-2">
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
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 xl:grid-cols-6 gap-3 mx-auto w-full place-items-center px-0 pb-4">
                  {shuffledCards.map((cardItem, index) => renderCard(cardItem, index))}
                </div>
              )}
            </div>
            
            {/* Submit button - fixed at bottom */}
            <div className="py-4 pt-6 flex justify-center mt-auto action-area">
              <button
                onClick={handleSubmitVote}
                disabled={selectedCard === null || gameState.currentPhase === 'lobby'}
                className={`modern-button w-full max-w-md ${
                  selectedCard === null || gameState.currentPhase === 'lobby'
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'clickable'
                }`}
              >
                {gameState.currentPhase === 'lobby' ? 'Waiting for Game to Start' : 'Submit Vote'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
} 
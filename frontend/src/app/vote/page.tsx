'use client';

import { useState, useEffect, useRef, TouchEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSocket } from '@/context/SocketContext';

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

  const handleSubmitVote = () => {
    if (selectedCard === null || !socket || !gameState) return;
    
    // Don't allow voting if you're the storyteller
    if (isStoryteller) {
      alert("As the Storyteller, you don't need to vote!");
      return;
    }
    
    // Don't allow voting for your own card if you're not the storyteller
    const isOwnCard = gameState.playedCards[selectedCard]?.teamName === teamName;
    if (isOwnCard) {
      alert("You can't vote for your own card!");
      return;
    }
    
    socket.emit('submitVote', {
      teamName,
      votedCardIndex: selectedCard,
    });
  };
  
  const nextCard = () => {
    if (!gameState?.playedCards) return;
    setCurrentCardIndex((prev) => 
      prev === gameState.playedCards.length - 1 ? 0 : prev + 1
    );
    setSelectedCard(currentCardIndex + 1 === gameState.playedCards.length ? 0 : currentCardIndex + 1);
  };
  
  const prevCard = () => {
    if (!gameState?.playedCards) return;
    setCurrentCardIndex((prev) => 
      prev === 0 ? gameState.playedCards.length - 1 : prev - 1
    );
    setSelectedCard(currentCardIndex === 0 ? gameState.playedCards.length - 1 : currentCardIndex - 1);
  };
  
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

  const hasVoted = gameState.votes[teamName] !== undefined;
  const isStoryteller = gameState.storytellerTeam === teamName;
  
  // Render a card
  const renderCard = (playedCard: any, index: number) => {
    const isSelected = selectedCard === index;
    
    return (
      <div 
        key={index} 
        className={`relative overflow-hidden p-1.5 md:p-1.5 cursor-pointer`}
        onClick={() => setSelectedCard(index)}
      >
        <div 
          className={`aspect-[732/1064] bg-gray-200 flex items-center justify-center overflow-hidden rounded-lg transition-transform duration-200 ${
            isSelected 
              ? 'ring-4 ring-blue-600 z-10' 
              : 'hover:ring-2 hover:ring-blue-300'
          }`}
          style={{
            transform: isSelected ? 'scale(1.01)' : 'scale(1)',
            transformOrigin: 'center'
          }}
        >
          <Image
            src={`/cards/${playedCard.card}`}
            alt={`Card option ${index + 1}`}
            width={isMobile ? 140 : 120}
            height={isMobile ? 204 : 175}
            className="w-full h-auto object-contain"
            style={{
              display: 'block',
              margin: 'auto',
              maxHeight: '100%',
              maxWidth: '100%'
            }}
          />
        </div>
      </div>
    );
  };
  
  return (
    <main className="flex min-h-screen flex-col items-center overflow-hidden">
      <div className="w-full max-w-[1600px] flex-1 flex flex-col overflow-hidden p-4 px-8 sm:p-8 sm:px-12">
        <div className="mb-3 md:mb-5">
          <h1 className="text-xl md:text-2xl font-bold">Vote for a Card</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Vote for which card you think was submitted by the storyteller: <span className="font-bold">{gameState.storytellerTeam}</span>
          </p>
        </div>
        
        {hasVoted ? (
          <div className="bg-green-50 p-3 px-6 rounded-lg mb-4 text-center">
            <p className="text-base">
              Your vote has been submitted! Waiting for other teams to vote...
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {isMobile ? (
              // Mobile carousel view
              <div className="relative flex flex-col items-center h-full pb-32">
                {gameState.playedCards.length > 0 && (
                  <>
                    <div className="flex items-center justify-between w-full mb-4 px-4">
                      <button 
                        onClick={prevCard}
                        className="bg-gray-200 hover:bg-gray-300 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full shadow-sm transition-colors cursor-pointer"
                        aria-label="Previous card"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M15 18l-6-6 6-6" />
                        </svg>
                      </button>
                      <span className="text-sm md:text-base font-medium">
                        {currentCardIndex + 1} / {gameState.playedCards.length}
                      </span>
                      <button 
                        onClick={nextCard}
                        className="bg-gray-200 hover:bg-gray-300 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full shadow-sm transition-colors cursor-pointer"
                        aria-label="Next card"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </button>
                    </div>
                    <div 
                      ref={carouselRef}
                      className="w-full max-w-[80vw] h-[55vh] mx-auto flex items-center justify-center mb-6"
                      onTouchStart={onTouchStart}
                      onTouchMove={onTouchMove}
                      onTouchEnd={onTouchEnd}
                    >
                      {renderCard(gameState.playedCards[currentCardIndex], currentCardIndex)}
                    </div>
                  </>
                )}
              </div>
            ) : (
              // Desktop grid
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6 mx-auto w-full place-items-center px-4 pb-32 md:max-h-[calc(100vh-160px)] md:overflow-y-auto">
                {gameState.playedCards.map((card, index) => renderCard(card, index))}
              </div>
            )}
            
            {!hasVoted && !isStoryteller && (
              <div className="fixed bottom-12 left-0 right-0 flex justify-center w-full">
                <button
                  onClick={handleSubmitVote}
                  disabled={selectedCard === null}
                  className={`py-2 md:py-3 px-8 md:px-10 text-sm md:text-base font-medium rounded-md transition-colors cursor-pointer shadow-md ${
                    selectedCard === null
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  Submit Vote
                </button>
              </div>
            )}
            {!hasVoted && isStoryteller && (
              <div className="fixed bottom-12 left-0 right-0 flex justify-center w-full">
                <div className="bg-yellow-50 p-3 rounded-md shadow-md text-center">
                  <p className="text-sm">
                    As the Storyteller, you don't vote in this round.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
} 
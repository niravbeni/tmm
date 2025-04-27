'use client';

import { useState, useEffect, useRef, TouchEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSocket } from '@/context/SocketContext';

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
    
    socket.emit('submitCard', {
      teamName,
      cardIndex: selectedCard,
    });
    
    setHasSubmitted(true);
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
      <div className="flex min-h-screen flex-col items-center justify-center p-6 px-8">
        <h1 className="mb-8 text-4xl font-bold text-center">Loading...</h1>
      </div>
    );
  }

  // If team not found or no hand
  if (!gameState.teams[teamName] || !gameState.teams[teamName].hand) {
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

  const team = gameState.teams[teamName];
  
  // Render a card from the player's hand
  const renderHandCard = (card: string, index: number) => (
    <div
      key={card}
      className="relative cursor-pointer rounded-lg overflow-hidden p-1.5 md:p-1.5"
      onClick={() => setSelectedCard(index)}
    >
      <div 
        className={`aspect-[732/1064] bg-gray-200 flex items-center justify-center overflow-hidden rounded-lg transition-transform duration-200 ${
          selectedCard === index 
            ? 'ring-4 ring-blue-600 z-10' 
            : 'hover:ring-2 hover:ring-blue-300'
        }`}
        style={{
          transform: selectedCard === index ? 'scale(1.01)' : 'scale(1)',
          transformOrigin: 'center'
        }}
      >
        <Image
          src={`/cards/${card}`}
          alt={`Card ${index + 1}`}
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
  
  const renderSelectedCard = (card: string) => (
    <div className="relative rounded-lg overflow-hidden">
      <div className="aspect-[732/1064] bg-gray-200 flex items-center justify-center overflow-hidden">
        <Image
          src={`/cards/${card}`}
          alt="Selected card"
          width={183}
          height={266}
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
  
  return (
    <main className="flex min-h-screen flex-col items-center overflow-hidden">
      <div className="w-full max-w-[1600px] flex-1 flex flex-col overflow-hidden p-4 px-8 sm:p-8 sm:px-12">
        <div className="mb-2 md:mb-5">
          <h1 className="text-xl md:text-2xl font-bold">Your Hand</h1>
          {teamName && (
            <p className="text-sm md:text-base text-gray-600">
              Team: <span className="font-bold">{teamName}</span>
            </p>
          )}
        </div>
        
        {/* Storyteller Badge - More compact on mobile */}
        {gameState.storytellerTeam === teamName && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 p-2 md:p-3 mb-2 md:mb-4 rounded-md">
            <div className="flex items-center">
              <span className="text-yellow-500 text-base md:text-xl mr-1 md:mr-2">🎭</span>
              <h2 className="font-bold text-sm md:text-base">You are the Storyteller this round!</h2>
            </div>
            <p className="text-xs md:text-sm mt-0.5 md:mt-1">
              Select a card and think of a clue or hint to describe it. After selecting, tell your clue to all players!
            </p>
          </div>
        )}
        
        {hasSubmitted ? (
          <div className="bg-green-50 p-3 px-6 rounded-lg mb-4 text-center">
            <p className="text-base">
              {gameState.storytellerTeam === teamName 
                ? "You've submitted your card and provided a clue! Waiting for other teams to submit their cards..."
                : "You've submitted your card! Waiting for other teams to submit their cards..."}
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            <p className="mb-2 md:mb-3 text-xs md:text-sm text-center">
              {gameState.storytellerTeam === teamName 
                ? "Select a card and give a clue about it"
                : `Select a card that matches the clue from ${gameState.storytellerTeam}!`}
            </p>
            
            <div className={`flex-1 min-h-0 overflow-y-auto pb-0 ${gameState.storytellerTeam === teamName ? 'max-h-[calc(100vh-220px)]' : ''}`}>
              {isMobile ? (
                // Mobile carousel view - with clear separation between navigation and card
                <div className="relative flex flex-col items-center h-full pb-32">
                  {team.hand.length > 0 && (
                    <>
                      <div className="flex justify-between w-full px-4 z-10 bg-white pb-3">
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
                          {currentCardIndex + 1} / {team.hand.length}
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

                      {/* Clear separation with invisible spacing instead of a visible border */}
                      <div className="w-full h-4"></div>
                      
                      {/* Added more space */}
                      <div className="h-6"></div>
                      
                      <div 
                        ref={carouselRef}
                        className={`w-full max-w-[80vw] mx-auto flex items-center justify-center mb-6 pt-4 ${
                          gameState.storytellerTeam === teamName ? 'h-[45vh] md:h-[55vh]' : 'h-[50vh]'
                        }`}
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                      >
                        {renderHandCard(team.hand[currentCardIndex], currentCardIndex)}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                // Desktop responsive grid
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6 mx-auto w-full place-items-center px-4 pb-32">
                  {team.hand.map((card, index) => renderHandCard(card, index))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="fixed bottom-12 left-0 right-0 flex justify-center w-full">
        <button
          onClick={handleSubmitCard}
          disabled={selectedCard === null}
          className={`py-2 md:py-3 px-8 md:px-10 text-sm md:text-base font-medium rounded-md transition-colors cursor-pointer shadow-md ${
            selectedCard === null
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          Submit Card
        </button>
      </div>
    </main>
  );
} 
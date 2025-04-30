'use client';

import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { MobileDetector } from '@/components/MobileDetector';

export default function IntroPage() {
  const router = useRouter();
  const [showPrecisionLine, setShowPrecisionLine] = useState(false);
  const [showVagueLine, setShowVagueLine] = useState(false);
  
  // State for the magnetic animation
  const [precisionClicks, setPrecisionClicks] = useState(0);
  const [showMagneticAnimation, setShowMagneticAnimation] = useState(false);
  const [startAttraction, setStartAttraction] = useState(false);
  const [precisionCollided, setPrecisionCollided] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [movingTogether, setMovingTogether] = useState(false);
  const [finalPositioning, setFinalPositioning] = useState(false);
  const [lineColorSwap, setLineColorSwap] = useState(false);
  
  // Add a shared timestamp for synchronized animations
  const [moveTogetherTimestamp, setMoveTogetherTimestamp] = useState(0);
  
  // State for creativity floating animation
  const [startCreativityFloat, setStartCreativityFloat] = useState(false);
  const [creativityFrozen, setCreativityFrozen] = useState(false);
  const [creativityPosition, setCreativityPosition] = useState(0);
  const [creativityStartTime, setCreativityStartTime] = useState(0);
  const [creativityPauseTime, setCreativityPauseTime] = useState(0);
  
  // State for line rotation
  const [lineRotated, setLineRotated] = useState(false);
  const [lineRotation, setLineRotation] = useState(0);
  const [creativityTouchedLine, setCreativityTouchedLine] = useState(false);
  const [creativityLockedToLine, setCreativityLockedToLine] = useState(false);
  const [lineBottom, setLineBottom] = useState(0);
  const [lineCenter, setLineCenter] = useState({ x: 0, y: 0 });
  const [creativityOffsetX, setCreativityOffsetX] = useState(0);
  const [creativityInitialRight, setCreativityInitialRight] = useState(0);
  const [creativityLeftPosition, setCreativityLeftPosition] = useState(0);
  
  // Position tracking for exact placement
  const [contactPosition, setContactPosition] = useState({ left: 0, top: 0 });
  const [seesaw, setSeesaw] = useState(false);
  
  // Vagueness draggable state
  const [vagueDraggable, setVagueDraggable] = useState(false);
  const [vagueDragPosition, setVagueDragPosition] = useState({ x: 0, y: 0 });
  
  // References for container and elements
  const containerRef = useRef<HTMLDivElement>(null);
  const precisionRef = useRef<HTMLDivElement>(null);
  const meaningRef = useRef<HTMLDivElement>(null);
  const vagueRef = useRef<HTMLDivElement>(null);
  const creativityRef = useRef<HTMLDivElement>(null);
  const horizontalLineRef = useRef<HTMLDivElement>(null);
  
  const [precisionCoords, setPrecisionCoords] = useState({ start: { x: 0, y: 0 }, end: { x: 0, y: 0 } });
  const [vagueCoords, setVagueCoords] = useState({ start: { x: 0, y: 0 }, end: { x: 0, y: 0 } });
  
  // Store original positions for animation
  const [originalPrecisionPosition, setOriginalPrecisionPosition] = useState({ x: 0, y: 0 });
  const [originalVaguePosition, setOriginalVaguePosition] = useState({ x: 0, y: 0 });
  const [originalCreativityPosition, setOriginalCreativityPosition] = useState({ x: 0, y: 0 });
  
  // Store vague path to prevent it from changing when precision is toggled
  const [vaguePath, setVaguePath] = useState("");
  const [vagueArrowPath, setVagueArrowPath] = useState("");
  
  // Function to calculate coordinates based on element positions
  const calculateCoordinates = () => {
    if (precisionRef.current && meaningRef.current && vagueRef.current && creativityRef.current) {
      // Get the SVG container directly
      const svgContainer = document.querySelector('svg.absolute')?.getBoundingClientRect() || { left: 0, top: 0 };
      
      const precisionRect = precisionRef.current.getBoundingClientRect();
      const meaningRect = meaningRef.current.getBoundingClientRect();
      const vagueRect = vagueRef.current.getBoundingClientRect();
      const creativityRect = creativityRef.current.getBoundingClientRect();
      
      // Store original positions for animation
      setOriginalPrecisionPosition({
        x: precisionRect.left + precisionRect.width / 2,
        y: precisionRect.top + precisionRect.height / 2
      });
      
      setOriginalVaguePosition({
        x: vagueRect.left + vagueRect.width / 2,
        y: vagueRect.top + vagueRect.height / 2
      });
      
      // Calculate the center points of each element
      const precisionCenter = {
        x: precisionRect.left + precisionRect.width / 2,
        y: precisionRect.bottom
      };
      
      const meaningCenter = {
        x: meaningRect.left + meaningRect.width / 2,
        y: meaningRect.top
      };
      
      const vagueCenter = {
        x: vagueRect.left + vagueRect.width / 2,
        y: vagueRect.bottom
      };
      
      const creativityCenter = {
        x: creativityRect.left + creativityRect.width / 2,
        y: creativityRect.top
      };
      
      // Get the coordinates relative to the SVG container
      setPrecisionCoords({
        start: { 
          x: precisionCenter.x - svgContainer.left,
          y: precisionCenter.y - svgContainer.top
        },
        end: { 
          x: meaningCenter.x - svgContainer.left,
          y: meaningCenter.y - svgContainer.top
        }
      });
      
      setVagueCoords({
        start: { 
          x: vagueCenter.x - svgContainer.left,
          y: vagueCenter.y - svgContainer.top
        },
        end: { 
          x: creativityCenter.x - svgContainer.left,
          y: creativityCenter.y - svgContainer.top
        }
      });

      // Reset paths to force recalculation
      if (showVagueLine) {
        setVaguePath("");
        setVagueArrowPath("");
      }
    }
  };
  
  // Calculate the positions of the words when component mounts and on resize
  useEffect(() => {
    // Delay the calculation to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      calculateCoordinates();
      
      // Also capture the horizontal line's position
      if (horizontalLineRef.current) {
        const lineRect = horizontalLineRef.current.getBoundingClientRect();
        setLineBottom(lineRect.top);
        setLineCenter({ 
          x: lineRect.left + lineRect.width / 2, 
          y: lineRect.top + lineRect.height / 2 
        });
      }
    }, 100);
    
    // Add resize event listener with debounce for better performance
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(calculateCoordinates, 150);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Generate and save vague path when vagueCoords change or when showVagueLine becomes true
  useEffect(() => {
    if (vagueCoords.start.x && vagueCoords.end.x && showVagueLine && vaguePath === "") {
      const { pathString, arrowPath } = createVaguePath();
      setVaguePath(pathString);
      setVagueArrowPath(arrowPath);
    }
  }, [vagueCoords, showVagueLine, vaguePath]);
  
  // Start creativity floating animation after a delay once the collision animation completes
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (finalPositioning && !startCreativityFloat) {
      timer = setTimeout(() => {
        setStartCreativityFloat(true);
        setCreativityStartTime(Date.now());
      }, 1000); // 2 second delay after final positioning before creativity starts floating
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [finalPositioning, startCreativityFloat]);
  
  // Function to calculate current position of creativity based on time elapsed
  const calculateCreativityPosition = () => {
    if (!startCreativityFloat) return 0;
    
    // Change to faster and more constant motion
    const totalDuration = 5000; // Reduce to 5 seconds for faster falling
    const totalDistance = 400; // 400px total distance
    
    let elapsedTime;
    
    if (creativityFrozen) {
      // If frozen, use the time when it was paused
      elapsedTime = creativityPauseTime - creativityStartTime;
    } else {
      // If not frozen, calculate based on current time
      elapsedTime = Date.now() - creativityStartTime;
    }
    
    // Ensure we don't exceed the total animation time
    elapsedTime = Math.min(elapsedTime, totalDuration);
    
    // Apply an easing function that accelerates slightly (simulating gravity)
    // This will start a bit slower and then speed up (more natural falling motion)
    const progress = elapsedTime / totalDuration;
    const easedProgress = progress * progress; // Quadratic easing for acceleration
    
    // Calculate position with acceleration
    return easedProgress * totalDistance;
  };
  
  // Update creativity position and check for collision with horizontal line
  useEffect(() => {
    if (!startCreativityFloat || creativityFrozen || creativityTouchedLine) return;
    
    const updatePosition = () => {
      const newPosition = calculateCreativityPosition();
      setCreativityPosition(newPosition);
      
      // Check if creativity has touched the horizontal line
      if (horizontalLineRef.current && creativityRef.current && containerRef.current && !creativityTouchedLine) {
        const lineRect = horizontalLineRef.current.getBoundingClientRect();
        const creativityRect = creativityRef.current.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        
        // Store line position for reference
        if (lineBottom === 0) {
          setLineBottom(lineRect.top);
          setLineCenter({ 
            x: lineRect.left + lineRect.width / 2, 
            y: lineRect.top + lineRect.height / 2 
          });
        }
        
        // Check if the bottom of creativity has reached the top of the line
        if (creativityRect.bottom >= lineRect.top) {
          // Save exact position relative to the container
          setContactPosition({ 
            left: creativityRect.left - containerRect.left, 
            top: creativityRect.top - containerRect.top
          });
          
          // First freeze everything in place
          setCreativityTouchedLine(true);
          setCreativityFrozen(true);
          
          // Short delay before showing the locked creativity to ensure no visual jump
          setTimeout(() => {
            setCreativityLockedToLine(true);
            
            // Add see-saw physics effect with a subtle shake before rotation
            setSeesaw(true);
            
            // Sequence the animations
            setTimeout(() => {
              setSeesaw(false);
              // Small delay after shake before rotating
              setTimeout(() => {
                setLineRotation(5);
                
                // Make vagueness draggable after rotation starts
                setTimeout(() => {
                  // Initialize vagueDragPosition with the final position
                  if (vagueRef.current && containerRef.current) {
                    const vagueRect = vagueRef.current.getBoundingClientRect();
                    const containerRect = containerRef.current.getBoundingClientRect();
                    const initialX = vagueRect.left - containerRect.left - (originalVaguePosition.x - originalVaguePosition.x);
                    setVagueDragPosition({ 
                      x: originalPrecisionPosition.x - originalVaguePosition.x,
                      y: 0 
                    });
                  }
                  setVagueDraggable(true);
                }, 1000); // Wait 1 second after rotation starts
              }, 200);
            }, 600); // Shake for 600ms
          }, 50);
        }
      }
    };
    
    const intervalId = setInterval(updatePosition, 16); // ~60fps
    
    return () => {
      clearInterval(intervalId);
    };
  }, [startCreativityFloat, creativityFrozen, creativityTouchedLine, lineBottom]);
  
  // Reset everything on third click
  const handlePrecisionClick = () => {
    const newClickCount = precisionClicks + 1;
    setPrecisionClicks(newClickCount);
    
    if (newClickCount === 1) {
      // First click - show precision line
      setShowPrecisionLine(true);
    } else if (newClickCount === 2) {
      // Second click - immediately turn precision text red
      setShowMagneticAnimation(true);
      
      // But delay the start of the actual movement
      setTimeout(() => {
        setStartAttraction(true);
      }, 800); // 800ms delay before vagueness starts moving
    } else {
      // Reset everything on third click but keep lines visible if they were
      setShowMagneticAnimation(false);
      setStartAttraction(false);
      setPrecisionCollided(false);
      setAnimationComplete(false);
      setMovingTogether(false);
      setFinalPositioning(false);
      setLineColorSwap(false);
      setStartCreativityFloat(false);
      setCreativityFrozen(false);
      setCreativityPosition(0);
      setCreativityStartTime(0);
      setCreativityPauseTime(0);
      setPrecisionClicks(0);
    }
  };

  // Create the precision path
  const createPrecisionPath = () => {
    if (!precisionCoords.start.x || !precisionCoords.end.x) return "";
    
    const { start, end } = precisionCoords;
    // Use a straight line for precision
    return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
  };

  // Create the arrow head for precision line
  const createPrecisionArrow = () => {
    if (!precisionCoords.start.x || !precisionCoords.end.x) return "";
    
    const { start, end } = precisionCoords;
    const arrowSize = 7; // Same size as vague arrow
    
    // Calculate the angle of the straight line
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    
    // Calculate arrow points based on the angle
    const arrowLeftX = end.x - arrowSize * Math.cos(angle - Math.PI/6);
    const arrowLeftY = end.y - arrowSize * Math.sin(angle - Math.PI/6);
    
    const arrowRightX = end.x - arrowSize * Math.cos(angle + Math.PI/6);
    const arrowRightY = end.y - arrowSize * Math.sin(angle + Math.PI/6);
    
    // Create the arrow path with the calculated angle
    return `M ${arrowLeftX} ${arrowLeftY} 
            L ${end.x} ${end.y} 
            L ${arrowRightX} ${arrowRightY}`;
  };

  // Create a perfectly smooth vague path
  const createVaguePath = () => {
    if (!vagueCoords.start.x || !vagueCoords.end.x) return { pathString: "", arrowPath: "" };
    
    const { start, end } = vagueCoords;
    
    // Start with a smooth flowing curve
    let pathString = `M ${start.x} ${start.y} `;
    
    // Single fluid upper loop - no sharp transitions
    pathString += `C ${start.x - 40} ${start.y + 40}, 
                    ${start.x - 80} ${start.y + 100}, 
                    ${start.x + 40} ${start.y + 80} `;
    
    // Continue the fluid curve to create natural transition
    pathString += `C ${start.x + 120} ${start.y + 65}, 
                    ${start.x + 150} ${start.y - 20}, 
                    ${start.x + 40} ${start.y - 60} `;
                    
    // Smooth curve back toward bottom section
    pathString += `C ${start.x - 40} ${start.y - 80}, 
                    ${start.x - 80} ${start.y - 20}, 
                    ${start.x - 50} ${start.y + 70} `;
    
    // Gentle transition into diagonal approach
    pathString += `C ${start.x - 30} ${start.y + 140}, 
                    ${start.x + 80} ${start.y + 160}, 
                    ${start.x + 150} ${start.y + 120} `;
    
    // Final smooth curve to the endpoint
    pathString += `C ${start.x + 220} ${start.y + 80}, 
                    ${end.x + 40} ${end.y - 40}, 
                    ${end.x} ${end.y}`;
    
    // Calculate the angle of the final segment approach
    // Use the control point to determine the incoming angle
    const finalControlX = end.x + 40;
    const finalControlY = end.y - 40;
    
    // Calculate angle in radians based on the final control point and endpoint
    const angle = Math.atan2(end.y - finalControlY, end.x - finalControlX);
    
    // Arrow size
    const arrowSize = 7;
    
    // Calculate arrow points based on the angle
    const arrowLeftX = end.x - arrowSize * Math.cos(angle - Math.PI/6);
    const arrowLeftY = end.y - arrowSize * Math.sin(angle - Math.PI/6);
    
    const arrowRightX = end.x - arrowSize * Math.cos(angle + Math.PI/6);
    const arrowRightY = end.y - arrowSize * Math.sin(angle + Math.PI/6);
    
    // Create the arrow path with the calculated angle
    const arrowPath = `M ${arrowLeftX} ${arrowLeftY} 
                        L ${end.x} ${end.y} 
                        L ${arrowRightX} ${arrowRightY}`;
    
    return { pathString, arrowPath };
  };

  // Calculate original positions including creativity
  useEffect(() => {
    if (creativityRef.current) {
      const creativityRect = creativityRef.current.getBoundingClientRect();
      setOriginalCreativityPosition({
        x: creativityRect.left + creativityRect.width / 2,
        y: creativityRect.top + creativityRect.height / 2
      });
    }
  }, []);

  // Reset vagueness position on component unmount
  useEffect(() => {
    return () => {
      setVagueDragPosition({ x: 0, y: 0 });
    };
  }, []);

  // Inside the component return, add a useEffect to ensure full container constraints
  useEffect(() => {
    if (vagueDraggable && containerRef.current && vagueRef.current) {
      // Set z-index to ensure it's above other elements when dragging
      if (vagueRef.current) {
        vagueRef.current.style.zIndex = "50";
        vagueRef.current.style.position = "relative";
      }
    }
  }, [vagueDraggable]);

  // Modify the onClick of creativityRef to not interfere with dragging
  useEffect(() => {
    if (creativityRef.current) {
      creativityRef.current.style.pointerEvents = vagueDraggable ? "none" : "auto";
    }
    if (horizontalLineRef.current) {
      horizontalLineRef.current.style.pointerEvents = "none";
    }
  }, [vagueDraggable]);

  return (
    <MobileDetector>
      <main className="flex flex-col h-full no-scroll">
        <div className="w-full mx-auto flex flex-col p-4 pb-4 h-full">
          <div className="mb-2 flex items-center justify-between">
            <div>
              {/* Left side - empty for now */}
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => router.push('/results')}
                className="status-badge bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Results
              </button>
              <button 
                onClick={() => router.push('/rules')}
                className="status-badge bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Rules
              </button>
            </div>
          </div>

          <div className="card p-8 mb-3 min-h-[92vh] flex flex-col">
            <h1 className="text-3xl font-bold text-center mb-1">Say Less.</h1>
            <p className="text-base italic text-center mb-4">(A Game of Precision, Vagueness, and Communication)</p>
            
            {/* Diagram container with perfect spacing */}
            <div 
              ref={containerRef}
              className="flex flex-col items-center justify-center mt-12 relative flex-grow"
            >
              {/* SVG container for both lines - positioned behind text with lower z-index */}
              <svg
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
                style={{ overflow: 'visible', zIndex: 0 }}
              >
                {/* Precision to Meaning arrow line */}
                {showPrecisionLine && (
                  <>
                    <motion.path
                      d={createPrecisionPath()}
                      stroke={showMagneticAnimation && !lineColorSwap ? "#dc2626" : "#3b82f6"}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="transparent"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ 
                        duration: 0.5, 
                        ease: "linear" // Linear for straight precision line
                      }}
                    />
                    {/* Arrow head */}
                    <motion.path
                      d={createPrecisionArrow()}
                      stroke={showMagneticAnimation && !lineColorSwap ? "#dc2626" : "#3b82f6"}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="transparent"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ 
                        delay: 0.45, 
                        duration: 0.2,
                        ease: "easeOut"
                      }}
                    />
                  </>
                )}

                {/* Vague to Creativity curved line */}
                {showVagueLine && vaguePath && (
                  <>
                    <motion.path
                      d={vaguePath}
                      stroke="#3b82f6"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="transparent"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ 
                        duration: 2.5, 
                        ease: [0.25, 0.1, 0.25, 1] // Custom cubic bezier for smoother flow
                      }}
                    />
                    
                    {/* Arrow head at the end */}
                    <motion.path
                      d={vagueArrowPath}
                      stroke="#3b82f6"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="transparent"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ 
                        delay: 2.4, 
                        duration: 0.3,
                        ease: "easeOut" 
                      }}
                    />
                  </>
                )}
              </svg>

              {/* Top row: Precision and Vague */}
              <div className="grid grid-cols-2 w-full max-w-lg mb-28 relative z-10">
                <div className="flex justify-center">
                  {/* Precision Text with Animation */}
                  <motion.div 
                    ref={precisionRef}
                    className={`text-xl font-semibold cursor-pointer ${
                      showPrecisionLine && !showMagneticAnimation ? 'text-blue-600' : 
                      showMagneticAnimation ? 'text-red-600' : ''
                    }`}
                    onClick={handlePrecisionClick}
                    animate={
                      showMagneticAnimation && !precisionCollided ? {
                        // Hold position until collision
                        x: 0
                      } : movingTogether ? {
                        // Move both together to left so V sits at original P position
                        x: -65, // Move further left to avoid overlap
                        transition: {
                          type: "tween", // Use tween for consistent movement
                          ease: "easeOut",
                          duration: 0.5,
                          // Use a timestamp to ensure animations start at the exact same time
                          delay: 0.02, // Small delay to ensure this happens after Vagueness starts moving
                          onComplete: () => {
                            // After moving together, trigger the small bump and color change
                            setMovingTogether(false);
                            setFinalPositioning(true);
                            // Swap the line color back to blue
                            setLineColorSwap(true);
                          }
                        }
                      } : finalPositioning ? {
                        // Final small bump of precision to the left
                        x: -100, // Reduced from -110px for a smaller final bump
                        transition: {
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                          duration: 0.4
                        }
                      } : {}
                    }
                  >
                    Precision
                  </motion.div>
                </div>
                <div className="flex justify-center">
                  {/* Vagueness Text with Magnetic Animation */}
                  <motion.div 
                    ref={vagueRef}
                    className={`text-xl font-semibold cursor-pointer ${
                      showVagueLine ? 'text-blue-600' : 
                      lineColorSwap ? 'text-blue-600' : ''
                    }`}
                    onClick={() => {
                      if (!vagueDraggable) {
                        if (showVagueLine) {
                          setVaguePath("");
                          setVagueArrowPath("");
                        }
                        setShowVagueLine(!showVagueLine);
                      }
                    }}
                    {...(vagueDraggable ? {
                      drag: true,
                      dragMomentum: false,
                      style: { cursor: 'grab', position: 'absolute', zIndex: 100 },
                      whileDrag: { cursor: 'grabbing' }
                    } : {})}
                    animate={
                      vagueDraggable ? 
                      { x: vagueDragPosition.x, y: vagueDragPosition.y } : 
                      startAttraction && !precisionCollided ? {
                        // Initial attraction - move toward precision
                        x: (originalPrecisionPosition.x - originalVaguePosition.x) + 100, // Collision point much further to the right
                        transition: {
                          type: "tween", // Use tween instead of spring to avoid bounce
                          ease: "easeOut", // Ease out for smooth movement without bounce
                          duration: 1.3,  // Reduced from 1.8s for faster initial movement
                          onComplete: () => {
                            setPrecisionCollided(true);
                            setMovingTogether(true);
                            // Set timestamp for synchronized animations
                            setMoveTogetherTimestamp(Date.now());
                          }
                        }
                      } : movingTogether ? {
                        // Move to exactly where Precision originally was
                        x: originalPrecisionPosition.x - originalVaguePosition.x + 30, // Offset further to prevent overlap
                        transition: {
                          type: "tween", // Use tween instead of spring for consistent movement
                          ease: "easeOut",
                          duration: 0.5,
                        }
                      } : finalPositioning ? {
                        // Final position exactly at precision's original position
                        x: originalPrecisionPosition.x - originalVaguePosition.x,
                        transition: {
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                          duration: 0.6,
                          onComplete: () => {
                            // When final positioning completes, capture this position as the initial drag position
                            setVagueDragPosition({ 
                              x: originalPrecisionPosition.x - originalVaguePosition.x, 
                              y: 0 
                            });
                          }
                        }
                      } : {}
                    }
                    onDragEnd={(e, info) => {
                      // Update vagueness position after drag
                      setVagueDragPosition({
                        x: vagueDragPosition.x + info.offset.x,
                        y: vagueDragPosition.y + info.offset.y
                      });
                    }}
                  >
                    Vagueness
                  </motion.div>
                </div>
              </div>

              {/* Bottom row: Meaning and Creativity */}
              <div className="grid grid-cols-2 w-full max-w-lg relative z-10">
                <div className="flex justify-center">
                  <div ref={meaningRef} className="text-xl font-semibold">
                    Meaning
                  </div>
                </div>
                <div className="flex justify-center">
                  {!creativityLockedToLine && (
                    <motion.div 
                      ref={creativityRef} 
                      className="text-xl font-semibold cursor-pointer"
                      style={{ y: creativityPosition }}
                      onPointerDown={() => {
                        if (startCreativityFloat && !creativityTouchedLine) {
                          setCreativityFrozen(true);
                          setCreativityPauseTime(Date.now());
                        }
                      }}
                      onPointerUp={() => {
                        if (startCreativityFloat && creativityFrozen && !creativityTouchedLine) {
                          setCreativityFrozen(false);
                          // Update the start time to resume animation from current position
                          setCreativityStartTime(prev => Date.now() - (creativityPauseTime - prev));
                        }
                      }}
                      onPointerLeave={() => {
                        if (startCreativityFloat && creativityFrozen && !creativityTouchedLine) {
                          setCreativityFrozen(false);
                          // Update the start time to resume animation from current position
                          setCreativityStartTime(prev => Date.now() - (creativityPauseTime - prev));
                        }
                      }}
                    >
                      Creativity
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Line and Creativity container that rotate together */}
            <motion.div 
              className="w-full mt-auto relative"
              style={{ 
                marginTop: '180px',
                marginBottom: '120px',
                height: '2px',
                transformOrigin: 'center'
              }}
              animate={
                seesaw 
                  ? {
                      rotateZ: [0, -1, 1, -0.5, 0.5, 0], // Subtle shake effect
                    }
                  : { rotateZ: lineRotation }
              }
              transition={
                seesaw
                  ? {
                      duration: 0.6,
                      ease: "easeInOut",
                      times: [0, 0.2, 0.4, 0.6, 0.8, 1]
                    }
                  : { 
                      type: 'spring', 
                      damping: 15, // Less damping for more natural oscillation
                      stiffness: 60, // Lower stiffness for softer movement
                      mass: 1.5,    // More mass for more physics-like movement
                      duration: 2
                    }
              }
            >
              {/* The horizontal line */}
              <div 
                ref={horizontalLineRef}
                className="w-full pointer-events-none"
                style={{ 
                  height: '2px', 
                  backgroundColor: 'black',
                  zIndex: 10
                }}
              />
              
              {/* Creativity word attached to the line */}
              {creativityLockedToLine && (
                <div 
                  className="text-xl font-semibold absolute"
                  style={{ 
                    left: `${contactPosition.left}px`,
                    top: `-25px`, 
                    zIndex: 20,
                    transformOrigin: 'bottom center'
                  }}
                >
                  Creativity
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </MobileDetector>
  );
}
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
  
  // Track when vagueness is over the squiggly line
  const [vagueLineErasing, setVagueLineErasing] = useState(false);
  const [vagueLineOpacity, setVagueLineOpacity] = useState(1);
  const [vagueLineBlur, setVagueLineBlur] = useState(0);
  const [isActivelyDragging, setIsActivelyDragging] = useState(false);
  
  // Track when precision word is being erased
  const [precisionErasing, setPrecisionErasing] = useState(false);
  const [precisionOpacity, setPrecisionOpacity] = useState(1);
  const [precisionBlur, setPrecisionBlur] = useState(0);
  
  // Track precision line erasing and meaning falling
  const [precisionLineErasing, setPrecisionLineErasing] = useState(false);
  const [meaningFalling, setMeaningFalling] = useState(false);
  const [meaningPosition, setMeaningPosition] = useState(0);
  const [meaningVisible, setMeaningVisible] = useState(true);
  const [lineBroken, setLineBroken] = useState(false);
  
  // Quote reveal
  const [quoteVisible, setQuoteVisible] = useState(false);
  
  // Line halves falling
  const [lineHalvesFalling, setLineHalvesFalling] = useState(false);
  const [lineTopHalfPosition, setLineTopHalfPosition] = useState(0);
  const [lineBottomHalfPosition, setLineBottomHalfPosition] = useState(0);
  const [lineHalvesRotation, setLineHalvesRotation] = useState({ top: 0, bottom: 0 });
  
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
  
  // Add a state for tracking meaning attachment
  const [hasLatchedToLine, setHasLatchedToLine] = useState(false);
  
  // Add a state for meaning tilt - initialize with line rotation to match it
  const [meaningTilt, setTilt] = useState(lineRotation);
  
  // Add state for color change when seesaw is balanced
  const [lineBalanced, setLineBalanced] = useState(false);
  
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
    const arrowPath = `M ${arrowLeftX} ${arrowLeftY} L ${end.x} ${end.y} L ${arrowRightX} ${arrowRightY}`;
    
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

  // Reset vague line state when toggled
  useEffect(() => {
    if (showVagueLine) {
      setVagueLineOpacity(1);
      setVagueLineBlur(0);
      setVagueLineErasing(false);
    }
  }, [showVagueLine]);

  // Reset state when component unmounts
  useEffect(() => {
    return () => {
      setVagueDragPosition({ x: 0, y: 0 });
      setPrecisionOpacity(1);
      setPrecisionBlur(0);
      setPrecisionErasing(false);
    };
  }, []);

  // Reset precision word state if clicked again
  useEffect(() => {
    if (precisionClicks === 0) {
      setPrecisionOpacity(1);
      setPrecisionBlur(0);
      setPrecisionErasing(false);
    }
  }, [precisionClicks]);

  // Simplify seesaw animation - only happens once when meaning lands
  useEffect(() => {
    if (!meaningFalling) return;
    
    // Further reduced duration for faster falling
    const totalDuration = 2000;
    const totalDistance = 400;
    const startTime = Date.now();
    
    const lineY = horizontalLineRef.current?.getBoundingClientRect().top || 0;
    const meaningY = meaningRef.current?.getBoundingClientRect().top || 0;
    const distanceToLine = lineY - meaningY - 10;
    
    // Start with a tilt matching line rotation
    const initialTilt = lineRotation;
    
    const fallInterval = setInterval(() => {
      if (hasLatchedToLine) return;
      
      const elapsedTime = Date.now() - startTime;
      const progress = Math.min(elapsedTime / totalDuration, 1);
      const easedProgress = progress * progress * (3 - 2 * progress);
      
      const fallPosition = easedProgress * totalDistance;
      
      // Gradually reduce tilt
      if (progress < 0.8) {
        const currentTilt = initialTilt * (1 - progress / 0.8);
        setTilt(currentTilt);
      } else {
        setTilt(0);
      }
      
      // Check if meaning has reached the line
      if (fallPosition >= distanceToLine) {
        setHasLatchedToLine(true);
        
        // ONE-TIME seesaw animation sequence
        // First impact - exaggerate rotation
        setLineRotation(lineRotation + 2);
        
        // Then single rebalance
        setTimeout(() => {
          // Return to neutral with one clean motion
          setLineRotation(-1); // Just a tiny overshoot in the other direction
          
          // Then settle to perfect horizontal
          setTimeout(() => {
            setLineRotation(0);
            // When the line is balanced, change the color to purple
            setLineBalanced(true);
            // No more seesaw animations after this
          }, 250);
        }, 150);
      } else {
        setMeaningPosition(fallPosition);
      }
      
      if (progress >= 1 && !hasLatchedToLine) {
        clearInterval(fallInterval);
      }
    }, 16);
    
    return () => clearInterval(fallInterval);
  }, [meaningFalling, hasLatchedToLine, lineRotation]);

  // Make sure the arrow is completely removed when the lines break
  useEffect(() => {
    if (!precisionLineErasing) return;
    
    // Delay slightly to let the DOM update
    setTimeout(() => {
      // Find any arrows on the page that aren't in the bottom group
      const svgContainer = document.querySelector('svg.absolute');
      if (!svgContainer) return;
      
      // Get all arrow elements
      const allArrows = svgContainer.querySelectorAll('path.precision-line-arrow');
      
      // Get the bottom group if it exists
      const elements = (document as any).lineHalfElements || {};
      const bottomHalf = elements.bottomHalf;
      
      // Remove any arrow that isn't a child of the bottom group
      allArrows.forEach(arrow => {
        if (!bottomHalf || arrow.parentNode !== bottomHalf) {
          console.log("Removing stray arrow element");
          if (arrow.parentNode) {
            arrow.parentNode.removeChild(arrow);
          }
        }
      });
      
      // Delete any original precision line arrows
      const allPaths = svgContainer.querySelectorAll('path');
      allPaths.forEach(path => {
        const d = path.getAttribute('d') || '';
        // Identify arrow paths by their characteristics
        const isArrowPath = d.includes('M') && d.includes('L') && 
                           !d.includes('C') && // Not a curve
                           (d.match(/L/g) || []).length === 2; // Exactly 2 line segments
        const stroke = path.getAttribute('stroke') || '';
        const isArrowStroke = stroke === '#3b82f6' || stroke === '#dc2626'; // Blue or red
        
        // If it looks like an arrow and isn't in the bottom group, remove it
        if (isArrowPath && isArrowStroke && (!bottomHalf || path.parentNode !== bottomHalf)) {
          console.log("Removing original arrow path");
          if (path.parentNode) {
            path.parentNode.removeChild(path);
          }
        }
      });
    }, 10);
  }, [precisionLineErasing]);

  // Update the line falling animation to GUARANTEE arrow removal
  useEffect(() => {
    if (!lineHalvesFalling) return;
    
    // Find and remove ALL arrow elements that aren't in the group
    const removeStrayArrows = () => {
      const svgContainer = document.querySelector('svg.absolute');
      if (!svgContainer) return;
      
      // Get all paths in the SVG
      const allPaths = svgContainer.querySelectorAll('path');
      
      // Get the bottom group if it exists
      const elements = (document as any).lineHalfElements || {};
      const bottomHalf = elements.bottomHalf;
      
      // Check each path to see if it matches the arrow parameters or looks like an arrow
      allPaths.forEach(path => {
        const d = path.getAttribute('d') || '';
        const isArrowPath = d.includes('M') && d.includes('L') && 
                           !d.includes('C') && // Not a curve
                           (d.match(/L/g) || []).length >= 2; // At least 2 line segments
        const isInBottomGroup = bottomHalf && path.parentNode === bottomHalf;
        
        // If it's an arrow-like path but not in the bottom group, remove it
        if (isArrowPath && !isInBottomGroup) {
          console.log("Removing stray arrow-like path");
          if (path.parentNode) {
            path.parentNode.removeChild(path);
          }
        }
      });
    };
    
    // Run multiple times to catch timing issues
    removeStrayArrows();
    const timers = [
      setTimeout(removeStrayArrows, 50),
      setTimeout(removeStrayArrows, 150),
      setTimeout(removeStrayArrows, 300)
    ];
    
    // Normal animation code
    const elements = (document as any).lineHalfElements;
    if (!elements) return;
    
    const { topHalf, bottomHalf } = elements;
    
    // Save origins
    const topOrigin = topHalf?.style.transformOrigin;
    const bottomOrigin = bottomHalf?.style.transformOrigin;
    
    let topFallPosition = 0;
    let bottomFallPosition = 0;
    let topFallSpeed = 1;
    let bottomFallSpeed = 2;
    let topRotation = 0;
    let bottomRotation = 0;
    const maxFall = 600;
    
    // Animation loop
    const animate = () => {
      topFallPosition += topFallSpeed;
      topFallSpeed += 0.3;
      topRotation -= 3;
      
      bottomFallPosition += bottomFallSpeed;
      bottomFallSpeed += 0.4;
      bottomRotation += 4;
      
      if (topHalf) {
        topHalf.style.transform = `translateY(${topFallPosition}px) rotate(${topRotation}deg)`;
      }
      
      if (bottomHalf) {
        bottomHalf.style.transform = `translateY(${bottomFallPosition}px) rotate(${bottomRotation}deg)`;
      }
      
      setLineTopHalfPosition(topFallPosition);
      setLineBottomHalfPosition(bottomFallPosition);
      setLineHalvesRotation({
        top: topRotation,
        bottom: bottomRotation
      });
      
      if (bottomFallPosition >= maxFall) {
        if (topHalf?.parentNode) topHalf.parentNode.removeChild(topHalf);
        if (bottomHalf?.parentNode) bottomHalf.parentNode.removeChild(bottomHalf);
        
        // One final check to remove any stray arrows
        removeStrayArrows();
        
        // Store the center point for quote positioning
        const midPoint = {
          x: parseFloat(topOrigin?.split('px')[0] || '0'),
          y: parseFloat(topOrigin?.split('px')[1] || '0') + 100 // Add offset for quote
        };
        (document as any).brokenLineMidPoint = midPoint;
        
        setTimeout(() => setQuoteVisible(true), 100);
        return;
      }
      
      requestAnimationFrame(animate);
    };
    
    const animationId = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationId);
      timers.forEach(clearTimeout);
    };
  }, [lineHalvesFalling]);

  // In the useEffect, set the initialTilt from current line rotation when meaning starts falling
  useEffect(() => {
    if (meaningFalling) {
      // Reset tilt to match current line rotation when meaning starts falling
      setTilt(lineRotation);
    }
  }, [meaningFalling, lineRotation]);

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
                      animate={{ 
                        pathLength: 1,
                        opacity: vagueLineOpacity,
                        filter: `blur(${vagueLineBlur}px)` 
                      }}
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
                      animate={{ 
                        opacity: vagueLineOpacity,
                        filter: `blur(${vagueLineBlur}px)`
                      }}
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
                      } : precisionErasing ? {
                        // Let the CSS transition handle the visual effects
                        // This is just to update the React state
                        opacity: precisionOpacity,
                        filter: `blur(${precisionBlur}px)`,
                      } : {}
                    }
                    style={
                      precisionErasing ? {
                        opacity: precisionOpacity,
                        filter: `blur(${precisionBlur}px)`,
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
                        // Reset opacity when toggling
                        setVagueLineOpacity(1);
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
                    onDragStart={() => {
                      console.log("Drag started");
                      setIsActivelyDragging(true);
                    }}
                    onDrag={(e, info) => {
                      // Instead of updating React state on every frame (which causes jitter),
                      // only check for intersection here but don't update position state
                      
                      // Get current element positions for intersection check
                      if (vagueRef.current && vagueDraggable) {
                        const vagueRect = vagueRef.current.getBoundingClientRect();
                        
                        // Check for vague line overlap if it's visible and not already erasing
                        if (showVagueLine && !vagueLineErasing) {
                          console.log("Checking for vague line overlap");
                          
                          // Get ONLY the squiggly line path elements by checking if they're for the vague line
                          const allPaths = document.querySelectorAll('svg.absolute path');
                          // Use a different approach to identify the vague paths - since we know vague line is more complex
                          // and has a longer path string. Precision line has a straight path like "M x y L x y"
                          
                          // Find the vague path specifically
                          const vaguePaths: SVGPathElement[] = [];
                          allPaths.forEach(path => {
                            const pathD = path.getAttribute('d') || '';
                            // Need to distinguish between precision arrow and vague arrow
                            // Both have two L commands but vague path is more complex
                            
                            // Get stroke color to help identify which line (precision vs vague)
                            const strokeColor = path.getAttribute('stroke') || '';
                            
                            // For debugging
                            console.log(`Path with stroke ${strokeColor}, d=${pathD.substring(0, 30)}...`);
                            
                            // Check if this is part of the VAGUE line (right side)
                            // 1. Either it's the main squiggly path (has curve commands)
                            // 2. Or it's the vague arrow (has 2 L commands AND is associated with vague line)
                            // The vague line never has red stroke (red is only for precision during animation)
                            const isVaguePath = pathD.includes('C ');
                            const isVagueArrow = pathD.startsWith('M ') && 
                                               pathD.match(/L /g)?.length === 2 && 
                                               !pathD.includes('C ') &&
                                               vagueCoords.end.x > 0 &&
                                               // Check if this path matches the vague arrow path
                                               pathD === vagueArrowPath.replace(/\s+/g, ' ').trim();
                            
                            if (isVaguePath || isVagueArrow) {
                              vaguePaths.push(path as SVGPathElement);
                              console.log(`Found vague ${isVaguePath ? 'path' : 'arrow'}: ${pathD.substring(0, 30)}...`);
                            } else {
                              console.log("Skipping non-vague path");
                            }
                          });
                          
                          if (vaguePaths.length > 0) {
                            console.log(`Found ${vaguePaths.length} vague line paths`);
                            
                            // Check overlap with any vague path
                            let foundIntersection = false;
                            
                            // Log the bounds for debugging if there's at least one vague path
                            const firstPathRect = vaguePaths[0].getBoundingClientRect();
                            console.log(`Vague path bounds: L:${firstPathRect.left} R:${firstPathRect.right} T:${firstPathRect.top} B:${firstPathRect.bottom}`);
                            console.log(`Vague text bounds: L:${vagueRect.left} R:${vagueRect.right} T:${vagueRect.top} B:${vagueRect.bottom}`);
                            
                            // Simple box intersection check first
                            vaguePaths.forEach((path, i) => {
                              const pathRect = path.getBoundingClientRect();
                              
                              // Simple intersection test
                              const overlap = !(
                                vagueRect.right < pathRect.left || 
                                vagueRect.left > pathRect.right || 
                                vagueRect.bottom < pathRect.top || 
                                vagueRect.top > pathRect.bottom
                              );
                              
                              if (overlap) {
                                console.log(`Overlap detected with vague path ${i}`);
                                foundIntersection = true;
                              }
                            });
                            
                            // If any overlap is found and not already erasing, start the fade out
                            if (foundIntersection) {
                              console.log("INTERSECTION FOUND - Starting erase effect for vague paths only");
                              setVagueLineErasing(true);
                              
                              // Directly manipulate only the vague paths
                              vaguePaths.forEach(pathElement => {
                                // Store the original properties
                                if (!pathElement.dataset.originalStroke) {
                                  pathElement.dataset.originalStroke = pathElement.getAttribute('stroke') || '';
                                  pathElement.dataset.originalStrokeWidth = pathElement.getAttribute('stroke-width') || '';
                                }
                              });
                              
                              // Use direct animation instead of React state
                              let opacity = 1;
                              let blur = 0;
                              
                              // First, make sure all paths have the same initial state
                              vaguePaths.forEach(pathElement => {
                                pathElement.style.opacity = '1';
                                pathElement.style.filter = 'blur(0px)';
                                pathElement.style.transition = 'opacity 0.6s ease-out, filter 0.6s ease-out';
                              });
                              
                              // Short delay to ensure CSS transition is applied
                              setTimeout(() => {
                                // Apply the fade to all paths simultaneously
                                vaguePaths.forEach(pathElement => {
                                  pathElement.style.opacity = '0';
                                  pathElement.style.filter = 'blur(8px)';
                                });
                                
                                // After the transition completes
                                setTimeout(() => {
                                  console.log("Fade complete, hiding all vague paths");
                                  
                                  // Hide all vague paths
                                  vaguePaths.forEach(pathElement => {
                                    pathElement.style.display = 'none';
                                  });
                                  
                                  // Update React state after animation is complete
                                  setShowVagueLine(false);
                                  setVagueLineErasing(false);
                                  setVagueLineBlur(0);
                                  setVagueLineOpacity(1); // Reset for next time
                                }, 600); // Match the duration from the transition
                              }, 50);
                            }
                          } else {
                            console.log("No vague paths found");
                          }
                        }
                        
                        // Check for overlap with precision word if it's not already being erased
                        if (!precisionErasing && precisionRef.current) {
                          console.log("Checking for precision word overlap");
                          
                          const precisionRect = precisionRef.current.getBoundingClientRect();
                          
                          // Calculate centers of both elements
                          const vagueCenterX = vagueRect.left + vagueRect.width / 2;
                          const vagueCenterY = vagueRect.top + vagueRect.height / 2;
                          
                          const precisionCenterX = precisionRect.left + precisionRect.width / 2;
                          const precisionCenterY = precisionRect.top + precisionRect.height / 2;
                          
                          // Calculate distance between centers
                          const distance = Math.sqrt(
                            Math.pow(vagueCenterX - precisionCenterX, 2) + 
                            Math.pow(vagueCenterY - precisionCenterY, 2)
                          );
                          
                          // Define an overlap threshold distance (roughly half the word width)
                          const overlapThreshold = precisionRect.width * 0.6;
                          
                          // Log distance for debugging
                          console.log(`Distance to precision: ${distance}, threshold: ${overlapThreshold}`);
                          
                          // Check if centers are close enough to be considered overlapping
                          if (distance < overlapThreshold) {
                            console.log("PRECISION OVERLAP DETECTED - Starting erase effect");
                            setPrecisionErasing(true);
                            
                            // Get the precision element for direct manipulation
                            if (precisionRef.current) {
                              // Set up transition
                              precisionRef.current.style.transition = 'opacity 0.6s ease-out, filter 0.6s ease-out';
                              
                              // Short delay to ensure CSS transition is applied
                              setTimeout(() => {
                                // Apply the fade
                                if (precisionRef.current) {
                                  precisionRef.current.style.opacity = '0';
                                  precisionRef.current.style.filter = 'blur(8px)';
                                  
                                  // After the transition completes
                                  setTimeout(() => {
                                    console.log("Precision fade complete, hiding word");
                                    
                                    // Hide precision word
                                    if (precisionRef.current) {
                                      precisionRef.current.style.visibility = 'hidden';
                                    }
                                    
                                    // Update React state
                                    setPrecisionOpacity(0);
                                    setPrecisionBlur(8);
                                    // Don't reset the erasing state to prevent retriggering
                                  }, 600); // Match the duration from the transition
                                }
                              }, 50);
                            }
                          }
                        }
                        
                        // Check for overlap with precision line (left blue line) if not already erasing
                        if (showPrecisionLine && !precisionLineErasing && !lineBroken) {
                          console.log("Checking for precision line overlap");
                          
                          // Get the precision line path elements by checking if they have straight paths
                          const allPaths = document.querySelectorAll('svg.absolute path');
                          const precisionPaths: SVGPathElement[] = [];
                          
                          allPaths.forEach(path => {
                            const pathD = path.getAttribute('d') || '';
                            // Precision paths are straight lines (no C commands, just M and L)
                            // and they should NOT be the vague path or arrow
                            if (!pathD.includes('C ') && pathD.startsWith('M ') && 
                                pathD.includes('L ') && (pathD.match(/L /g)?.length !== 2)) {
                              precisionPaths.push(path as SVGPathElement);
                              console.log("Found precision path:", pathD);
                            }
                          });
                          
                          if (precisionPaths.length > 0) {
                            // Check if vagueness overlaps with any precision path
                            let foundIntersection = false;
                            
                            precisionPaths.forEach((path, i) => {
                              const pathRect = path.getBoundingClientRect();
                              
                              // Get the center of the precision path
                              const pathCenterX = pathRect.left + pathRect.width / 2;
                              const pathCenterY = pathRect.top + pathRect.height / 2;
                              
                              // Get the center of the vague element
                              const vagueCenterX = vagueRect.left + vagueRect.width / 2;
                              const vagueCenterY = vagueRect.top + vagueRect.height / 2;
                              
                              // Calculate the distance from the vague center to the path center
                              const distanceToCenter = Math.sqrt(
                                Math.pow(vagueCenterX - pathCenterX, 2) + 
                                Math.pow(vagueCenterY - pathCenterY, 2)
                              );
                              
                              // Define a threshold distance from the center of the path
                              const centerThreshold = pathRect.height * 0.5;
                              
                              // Simple box intersection test plus center proximity check
                              const overlap = !(
                                vagueRect.right < pathRect.left || 
                                vagueRect.left > pathRect.right || 
                                vagueRect.bottom < pathRect.top || 
                                vagueRect.top > pathRect.bottom
                              ) && distanceToCenter < centerThreshold;
                              
                              if (overlap) {
                                console.log(`Overlap detected with precision path ${i} at center zone`);
                                foundIntersection = true;
                              }
                            });
                            
                            // If intersection found, break the line and make meaning fall
                            if (foundIntersection) {
                              console.log("PRECISION LINE BROKEN - Starting snap and fall");
                              setPrecisionLineErasing(true);
                              
                              // First snap the line
                              precisionPaths.forEach(pathElement => {
                                // Create a "snap" effect - make the line jagged then disappear
                                // Original path
                                const originalD = pathElement.getAttribute('d') || '';
                                
                                // Parse the path to get start and end points
                                const pathMatch = originalD.match(/M\s+([\d.]+)\s+([\d.]+)\s+L\s+([\d.]+)\s+([\d.]+)/);
                                if (pathMatch) {
                                  const x1 = parseFloat(pathMatch[1]);
                                  const y1 = parseFloat(pathMatch[2]);
                                  const x2 = parseFloat(pathMatch[3]);
                                  const y2 = parseFloat(pathMatch[4]);
                                  
                                  // Calculate midpoint - this is where the break will happen
                                  // Use the exact middle of the line
                                  const midX = (x1 + x2) / 2;
                                  const midY = (y1 + y2) / 2;
                                  
                                  // Hide the original path
                                  pathElement.style.opacity = '0';
                                  
                                  // Create two new paths for the halves
                                  const svgContainer = document.querySelector('svg.absolute');
                                  if (svgContainer) {
                                    // Create a group for bottom half and arrow to move together
                                    const bottomGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
                                    bottomGroup.style.transformOrigin = `${midX}px ${midY}px`;
                                    svgContainer.appendChild(bottomGroup);
                                    
                                    // Create top half (from start to midpoint)
                                    const topHalf = document.createElementNS("http://www.w3.org/2000/svg", "path");
                                    topHalf.setAttribute('d', `M ${x1} ${y1} L ${midX} ${midY}`);
                                    topHalf.setAttribute('stroke', '#3b82f6'); // Blue
                                    topHalf.setAttribute('stroke-width', '2.5');
                                    topHalf.setAttribute('stroke-linecap', 'round');
                                    topHalf.setAttribute('stroke-linejoin', 'round');
                                    topHalf.setAttribute('fill', 'transparent');
                                    topHalf.setAttribute('class', 'precision-line-half top-half');
                                    topHalf.style.transformOrigin = `${midX}px ${midY}px`;
                                    svgContainer.appendChild(topHalf);
                                    
                                    // Create bottom half (from midpoint to end) - this has the arrow
                                    const bottomHalf = document.createElementNS("http://www.w3.org/2000/svg", "path");
                                    bottomHalf.setAttribute('d', `M ${midX} ${midY} L ${x2} ${y2}`);
                                    bottomHalf.setAttribute('stroke', '#3b82f6'); // Blue
                                    bottomHalf.setAttribute('stroke-width', '2.5');
                                    bottomHalf.setAttribute('stroke-linecap', 'round');
                                    bottomHalf.setAttribute('stroke-linejoin', 'round');
                                    bottomHalf.setAttribute('fill', 'transparent');
                                    bottomHalf.setAttribute('class', 'precision-line-half bottom-half');
                                    bottomGroup.appendChild(bottomHalf);
                                    
                                    // Calculate a new arrow endpoint based on the shortened line
                                    const arrowLength = Math.sqrt(Math.pow(x2 - midX, 2) + Math.pow(y2 - midY, 2));
                                    const angle = Math.atan2(y2 - midY, x2 - midX);
                                    
                                    // Create a new arrow element that's properly positioned at the end of the bottom half
                                    const arrowSize = 7;
                                    
                                    // Calculate arrow points based on the line's angle
                                    const arrowLeftX = x2 - arrowSize * Math.cos(angle - Math.PI/6);
                                    const arrowLeftY = y2 - arrowSize * Math.sin(angle - Math.PI/6);
                                    
                                    const arrowRightX = x2 - arrowSize * Math.cos(angle + Math.PI/6);
                                    const arrowRightY = y2 - arrowSize * Math.sin(angle + Math.PI/6);
                                    
                                    // Create the arrow element with calculated path
                                    const arrowElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
                                    arrowElement.setAttribute('d', `M ${arrowLeftX} ${arrowLeftY} L ${x2} ${y2} L ${arrowRightX} ${arrowRightY}`);
                                    arrowElement.setAttribute('stroke', '#3b82f6'); // Blue
                                    arrowElement.setAttribute('stroke-width', '2.5');
                                    arrowElement.setAttribute('stroke-linecap', 'round');
                                    arrowElement.setAttribute('stroke-linejoin', 'round');
                                    arrowElement.setAttribute('fill', 'transparent');
                                    arrowElement.setAttribute('class', 'precision-line-arrow');
                                    bottomGroup.appendChild(arrowElement);
                                    
                                    // Store references to animate later
                                    (document as any).lineHalfElements = {
                                      topHalf,
                                      bottomHalf: bottomGroup,
                                      arrowElement
                                    };
                                    
                                    // Remove red dot code and start falling animation immediately
                                    setTimeout(() => {
                                      // Explicitly set these to start the animations
                                      setLineHalvesFalling(true);
                                      setLineBroken(true);
                                      setMeaningFalling(true);
                                      
                                      console.log("Starting line halves falling animation");
                                    }, 200);
                                  }
                                }
                              });
                            }
                          }
                        }
                      }
                    }}
                    onDragEnd={(e, info) => {
                      console.log("Drag ended");
                      // Only update position state at the end of drag
                      setVagueDragPosition({
                        x: vagueDragPosition.x + info.offset.x,
                        y: vagueDragPosition.y + info.offset.y
                      });
                      setIsActivelyDragging(false);
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
                    {meaningVisible && !hasLatchedToLine && (
                      <motion.div
                        style={{ 
                          y: meaningPosition,
                          rotate: meaningTilt,
                          display: meaningVisible ? 'block' : 'none'
                        }}
                      >
                        Meaning
                      </motion.div>
                    )}
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
                      rotateZ: [0, -1.5, 1, -0.7, 0.4, 0], // More natural oscillation
                    }
                  : { rotateZ: lineRotation }
              }
              transition={
                seesaw
                  ? {
                      duration: 0.6,
                      ease: "easeInOut",
                      times: [0, 0.2, 0.4, 0.6, 0.8, 1] // Even timing for oscillation
                    }
                  : { 
                      type: 'spring', 
                      damping: 15,
                      stiffness: 60, 
                      mass: 1.5,
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
                  backgroundColor: lineBalanced ? '#6B21A8' : 'black', // Darker purple when balanced
                  transition: 'background-color 0.5s ease-in-out',
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
                    color: lineBalanced ? '#6B21A8' : 'inherit', // Darker purple when balanced
                    transition: 'color 0.5s ease-in-out',
                    zIndex: 20,
                    transformOrigin: 'bottom center'
                  }}
                >
                  Creativity
                </div>
              )}
              
              {/* Meaning word attached to the line */}
              {hasLatchedToLine && (
                <div 
                  className="text-xl font-semibold absolute"
                  style={{ 
                    left: '37%', 
                    top: `-25px`, 
                    color: lineBalanced ? '#6B21A8' : 'inherit', // Darker purple when balanced
                    zIndex: 20,
                    transformOrigin: 'bottom center',
                    transition: 'color 0.5s ease-in-out, all 0.1s ease-out' // Combined transitions
                  }}
                >
                  Meaning
                </div>
              )}
            </motion.div>
            
            {/* SVG container for line halves falling */}
            {lineHalvesFalling && (
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
                <div className="precision-line-half top-half absolute" 
                  style={{ 
                    transform: `translateY(${lineTopHalfPosition}px) rotate(${lineHalvesRotation.top}deg)`,
                  }}
                />
                <div className="precision-line-half bottom-half absolute" 
                  style={{ 
                    transform: `translateY(${lineBottomHalfPosition}px) rotate(${lineHalvesRotation.bottom}deg)`,
                  }}
                />
              </div>
            )}
            
            {/* Quote that appears after meaning falls - no container, just text */}
            {quoteVisible && (
              <motion.div 
                style={{ 
                  position: 'absolute',
                  top: (document as any).brokenLineMidPoint?.y || vagueCoords.start.y + 450,
                  marginTop: '100px',
                  left: '25%', 
                  width: '50%',
                  zIndex: 20,
                  textAlign: 'center'
                }}
                initial={{
                  y: -200, // Start above
                  opacity: 0
                }}
                animate={{ 
                  y: 0, // Fall straight down
                  opacity: 1
                }}
                transition={{ 
                  type: "spring", 
                  damping: 15,
                  mass: 1.3,
                  stiffness: 70,
                  duration: 1.2,
                  delay: 0 // No delay after lines disappear
                }}
              >
                <p className="text-lg italic text-center mb-4">
                  "Poetry is the art of creating imaginary gardens with real toads."
                </p>
                <p className="text-center" style={{ marginLeft: '150px', marginRight: '0px' }}>― Marianne Moore</p>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </MobileDetector>
  );
}
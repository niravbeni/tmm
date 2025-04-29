'use client';

import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { MobileDetector } from '@/components/MobileDetector';

export default function IntroPage() {
  const router = useRouter();
  const [showPrecisionLine, setShowPrecisionLine] = useState(false);
  const [showVagueLine, setShowVagueLine] = useState(false);
  
  const precisionRef = useRef<HTMLDivElement>(null);
  const meaningRef = useRef<HTMLDivElement>(null);
  const vagueRef = useRef<HTMLDivElement>(null);
  const creativityRef = useRef<HTMLDivElement>(null);
  
  const [precisionCoords, setPrecisionCoords] = useState({ start: { x: 0, y: 0 }, end: { x: 0, y: 0 } });
  const [vagueCoords, setVagueCoords] = useState({ start: { x: 0, y: 0 }, end: { x: 0, y: 0 } });
  
  // Store vague path to prevent it from changing when precision is toggled
  const [vaguePath, setVaguePath] = useState("");
  const [vagueArrowPath, setVagueArrowPath] = useState("");
  
  // Function to calculate coordinates based on element positions
  const calculateCoordinates = () => {
    if (precisionRef.current && meaningRef.current && vagueRef.current && creativityRef.current) {
      const containerRect = precisionRef.current.closest('.relative')?.getBoundingClientRect() || { left: 0, top: 0 };
      
      const precisionRect = precisionRef.current.getBoundingClientRect();
      const meaningRect = meaningRef.current.getBoundingClientRect();
      const vagueRect = vagueRef.current.getBoundingClientRect();
      const creativityRect = creativityRef.current.getBoundingClientRect();
      
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
      
      // Get the coordinates relative to the container
      setPrecisionCoords({
        start: { 
          x: precisionCenter.x - containerRect.left,
          y: precisionCenter.y - containerRect.top
        },
        end: { 
          x: meaningCenter.x - containerRect.left,
          y: meaningCenter.y - containerRect.top
        }
      });
      
      setVagueCoords({
        start: { 
          x: vagueCenter.x - containerRect.left,
          y: vagueCenter.y - containerRect.top
        },
        end: { 
          x: creativityCenter.x - containerRect.left,
          y: creativityCenter.y - containerRect.top
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
    const timer = setTimeout(calculateCoordinates, 100);
    
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

          <div className="card p-8 mb-3">
            <h1 className="text-3xl font-bold text-center mb-1">Say Less.</h1>
            <p className="text-base italic text-center mb-4">(A Game of Precision, Vagueness, and Communication)</p>
            
            {/* Diagram container with perfect spacing */}
            <div className="flex flex-col items-center justify-center mt-12 relative">
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
                      stroke="#3b82f6"
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
                      stroke="#3b82f6"
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
                      stroke="#dc2626"
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
                      stroke="#dc2626"
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
                  <div 
                    ref={precisionRef}
                    className={`text-xl font-semibold cursor-pointer ${showPrecisionLine ? 'text-blue-600' : ''}`}
                    onClick={() => setShowPrecisionLine(!showPrecisionLine)}
                  >
                    Precision
                  </div>
                </div>
                <div className="flex justify-center">
                  <div 
                    ref={vagueRef}
                    className={`text-xl font-semibold cursor-pointer ${showVagueLine ? 'text-red-600' : ''}`}
                    onClick={() => {
                      if (showVagueLine) {
                        setVaguePath("");
                        setVagueArrowPath("");
                      }
                      setShowVagueLine(!showVagueLine);
                    }}
                  >
                    Vague
                  </div>
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
                  <div ref={creativityRef} className="text-xl font-semibold">
                    Creativity
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </MobileDetector>
  );
} 
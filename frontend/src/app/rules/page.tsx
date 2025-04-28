'use client';

import { useRouter } from 'next/navigation';
import { MobileDetector } from '@/components/MobileDetector';

export default function RulesPage() {
  const router = useRouter();

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
                onClick={() => router.push('/intro')}
                className="status-badge bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Intro
              </button>
            </div>
          </div>

          <div className="card p-8 mb-3">
            <h1 className="text-xl font-bold text-center mb-2">Say Less.</h1>
            <p className="text-base italic text-center mb-6">(A Game of Precision, Vagueness, and Communication)</p>
            
            <div className="flex flex-row gap-8 mb-2">
              {/* Left Column */}
              <div className="w-1/2 space-y-5">
                <section>
                  <h2 className="text-lg font-bold mb-2">Goal</h2>
                  <p className="text-base">Earn the highest score by mastering the balance between being precise and being vague.</p>
                </section>
                
                <section>
                  <h2 className="text-lg font-bold mb-2">Getting Started</h2>
                  <ul className="list-disc pl-5 text-base space-y-1">
                    <li>Form teams of 2-3 people each (ideally 6-12 teams total).</li>
                    <li>Open <a href="https://say-less.onrender.com" className="text-blue-600 underline">say-less.onrender.com</a> on your device.</li>
                    <li>Enter your team name and join the game.</li>
                    <li>Wait for the host to start the game.</li>
                  </ul>
                </section>
                        
                <section>
                  <h2 className="text-lg font-bold mb-2">How to Play</h2>
                  <p className="text-base mb-2">Each round, one team is designated as the Storyteller.</p>
                            
                  <div className="pl-3 mb-3">
                    <h3 className="text-base font-bold mb-1">The Storyteller Team:</h3>
                    <ul className="list-disc pl-5 text-base space-y-1">
                      <li>Receives 6 cards to choose from.</li>
                      <li>Discusses and selects one card to play.</li>
                      <li>Creates a clue to describe their chosen card.</li>
                      <li>Clues can be cryptic, abstract, movie references, song lyrics, IDEO project related, etc.</li>
                      <li>The clue should be carefully balanced - not too obvious, not too obscure.</li>
                    </ul>
                  </div>
                            
                  <div className="pl-3">
                    <h3 className="text-base font-bold mb-1">All Other Teams:</h3>
                    <ul className="list-disc pl-5 text-base space-y-1">
                      <li>Discuss and submit a card from their hand that best matches the clue.</li>
                      <li>Once all cards are submitted, teams vote on which card they believe belongs to the Storyteller.</li>
                      <li>Teams cannot vote for their own card.</li>
                    </ul>
                  </div>
                </section>
              </div>
              
              {/* Right Column */}
              <div className="w-1/2 flex flex-col justify-center space-y-4">
                <section>
                  <h2 className="text-base font-bold mb-1">Scoring</h2>
                  
                  <table className="w-auto text-xs border-collapse mb-2">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-gray-800">
                        <th className="border border-gray-300 dark:border-gray-700 px-2 py-1">Team</th>
                        <th className="border border-gray-300 dark:border-gray-700 px-2 py-1">Condition</th>
                        <th className="border border-gray-300 dark:border-gray-700 px-2 py-1 text-center">Points</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs">
                      <tr>
                        <td className="border border-gray-300 dark:border-gray-700 px-2 py-0.5" rowSpan={3}>Storyteller</td>
                        <td className="border border-gray-300 dark:border-gray-700 px-2 py-0.5">SOME teams find card</td>
                        <td className="border border-gray-300 dark:border-gray-700 px-2 py-0.5 text-center font-bold">3</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 dark:border-gray-700 px-2 py-0.5">ALL teams find card</td>
                        <td className="border border-gray-300 dark:border-gray-700 px-2 py-0.5 text-center font-bold">0</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 dark:border-gray-700 px-2 py-0.5">NO teams find card</td>
                        <td className="border border-gray-300 dark:border-gray-700 px-2 py-0.5 text-center font-bold">0</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 dark:border-gray-700 px-2 py-0.5" rowSpan={3}>Other Teams</td>
                        <td className="border border-gray-300 dark:border-gray-700 px-2 py-0.5">Finding Storyteller's card</td>
                        <td className="border border-gray-300 dark:border-gray-700 px-2 py-0.5 text-center font-bold">3</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 dark:border-gray-700 px-2 py-0.5">When ALL/NONE find Storyteller</td>
                        <td className="border border-gray-300 dark:border-gray-700 px-2 py-0.5 text-center font-bold">2</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 dark:border-gray-700 px-2 py-0.5">Each vote your card gets</td>
                        <td className="border border-gray-300 dark:border-gray-700 px-2 py-0.5 text-center font-bold">1</td>
                      </tr>
                    </tbody>
                  </table>
                </section>
                        
                <section>
                  <h2 className="text-base font-bold mb-1">Strategy Tips</h2>
                  <ul className="list-disc pl-4 text-xs space-y-0.5">
                    <li>Be creative with your clues!</li>
                    <li>As Storyteller, aim for a clue that some but not all teams will understand.</li>
                    <li>When guessing, pick cards that could match the clue but also attract votes.</li>
                    <li>Discuss options with your teammates to combine different perspectives.</li>
                  </ul>
                </section>
              </div>
            </div>
          </div>
        </div>
      </main>
    </MobileDetector>
  );
} 
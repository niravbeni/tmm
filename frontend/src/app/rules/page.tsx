'use client';

import { useRouter } from 'next/navigation';
import { MobileDetector } from '../results/page';

export default function RulesPage() {
  const router = useRouter();

  return (
    <MobileDetector>
      <main className="flex flex-col h-full no-scroll">
        <div className="w-full mx-auto flex flex-col p-4 pb-4 h-full">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => router.push('/results')}
                className="status-badge bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Results
              </button>
            </div>
          </div>

          <div className="card p-4 mb-3">
            <h1 className="text-xl font-bold mb-4">Game Rules</h1>
            
            <div className="space-y-4">
              <p className="text-sm">Rules content will go here.</p>
            </div>
          </div>
        </div>
      </main>
    </MobileDetector>
  );
} 
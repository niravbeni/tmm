'use client';

import { useRouter } from 'next/navigation';
import { MobileDetector } from '../results/page';

export default function RulesPage() {
  const router = useRouter();

  return (
    <MobileDetector>
      <main className="flex flex-col h-full p-4">
        <div className="w-full mx-auto max-w-5xl">
          <div className="mb-4 flex items-center">
            <button 
              onClick={() => router.push('/results')}
              className="status-badge bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              Results
            </button>
          </div>

          <h1 className="text-3xl font-bold mb-6">Game Rules</h1>

          <div className="card p-6">
            <p className="text-lg">Rules content will go here.</p>
          </div>
        </div>
      </main>
    </MobileDetector>
  );
} 
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamically import the App component to avoid SSR issues with browser APIs
const App = dynamic(() => import('../App'), { ssr: false });

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-200 border-t-neutral-900" />
      </div>
    }>
      <App />
    </Suspense>
  );
}

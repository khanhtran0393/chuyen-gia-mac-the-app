'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/workspace');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#050507] text-gray-400 flex items-center justify-center font-sans">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-bold tracking-wider uppercase text-orange-500 font-mono">Đang tải không gian làm việc...</p>
      </div>
    </div>
  );
}

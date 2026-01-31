import { useState } from 'react';
import { CreatePost } from '@/app/components/CreatePost';
import { Timeline } from '@/app/components/Timeline';
import { Auth } from '@/app/components/Auth';
import { Button } from '@/app/components/ui/button';
import { PenSquare, Home, LogOut, User } from 'lucide-react';
import { Toaster } from '@/app/components/ui/sonner';
import { UserProvider, useUser } from '@/app/contexts/UserContext';
import logoImage from 'figma:asset/a5afb829bc7d699627bde9302fdbdcbd06a8e3b3.png';

type Page = 'create' | 'timeline' | 'profile';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('create');
  const user = useUser();

  // ユーザーが認証されていない場合、認証画面を表示
  if (!user.isAuthenticated) {
    return (
      <>
        <Auth onAuthSuccess={(userId, name, accessToken) => {
          user.setUser(userId, name, accessToken);
        }} />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-white pb-32">
        {/* Header with dot logo */}
        <div className="bg-white border-b-0">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              {/* Logo image */}
              <img src={logoImage} alt="TypeSense Logo" className="w-12 h-12 object-contain" />
              
              {/* User info and logout */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                  <p className="text-xs text-gray-500">ID: {user.userId?.slice(0, 8)}...</p>
                </div>
                <button
                  onClick={user.logout}
                  className="p-2 rounded-full bg-white shadow-[4px_4px_8px_rgba(0,0,0,0.08),-4px_-4px_8px_rgba(255,255,255,0.9)] hover:shadow-[6px_6px_12px_rgba(0,0,0,0.1)] transition-all"
                  title="ログアウト"
                >
                  <LogOut size={18} className="text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {currentPage === 'create' ? (
          <CreatePost onPostCreated={() => setCurrentPage('timeline')} />
        ) : (
          <Timeline />
        )}

        {/* Floating Action Buttons */}
        <div className="fixed bottom-8 left-0 right-0 z-50 flex justify-center gap-6 pointer-events-none">
          <button
            onClick={() => setCurrentPage('timeline')}
            className={`rounded-full transition-all pointer-events-auto flex items-center justify-center ${
              currentPage === 'timeline'
                ? 'bg-gradient-to-br from-green-400 to-green-500 w-20 h-20 scale-100 shadow-[8px_8px_16px_rgba(0,0,0,0.15),-8px_-8px_16px_rgba(255,255,255,0.9)]'
                : 'bg-white w-16 h-16 hover:scale-105 shadow-[6px_6px_12px_rgba(0,0,0,0.1),-6px_-6px_12px_rgba(255,255,255,0.9)]'
            }`}
          >
            <Home 
              size={currentPage === 'timeline' ? 32 : 28} 
              className={currentPage === 'timeline' ? 'text-white' : 'text-green-500'} 
            />
          </button>
          <button
            onClick={() => setCurrentPage('create')}
            className={`rounded-full transition-all pointer-events-auto flex items-center justify-center ${
              currentPage === 'create'
                ? 'bg-gradient-to-br from-green-400 to-green-500 w-20 h-20 scale-100 shadow-[8px_8px_16px_rgba(0,0,0,0.15),-8px_-8px_16px_rgba(255,255,255,0.9)]'
                : 'bg-white w-16 h-16 hover:scale-105 shadow-[6px_6px_12px_rgba(0,0,0,0.1),-6px_-6px_12px_rgba(255,255,255,0.9)]'
            }`}
          >
            <PenSquare 
              size={currentPage === 'create' ? 32 : 28} 
              className={currentPage === 'create' ? 'text-white' : 'text-green-500'} 
            />
          </button>
        </div>
      </div>
      <Toaster />
    </>
  );
}

function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

export default App;
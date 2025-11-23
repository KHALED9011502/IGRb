import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { SignInPage } from './pages/SignInPage';
import { SignUpPage } from './pages/SignUpPage';
import { GamePage } from './pages/GamePage';
import { GamesPage } from './pages/GamesPage';
import { PostsPage } from './pages/PostsPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { WikiPage } from './pages/WikiPage';
import { ProfilePage } from './pages/ProfilePage';
import { DiscussionPage } from './pages/DiscussionPage';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [pageData, setPageData] = useState<string | undefined>();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleNavigate = (page: string, data?: string) => {
    setCurrentPage(page);
    setPageData(data);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCodeVerified = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'signin':
        return <SignInPage onNavigate={handleNavigate} />;
      case 'signup':
        return <SignUpPage onNavigate={handleNavigate} />;
      case 'game':
        return pageData ? <GamePage gameId={pageData} onNavigate={handleNavigate} /> : <HomePage onNavigate={handleNavigate} />;
      case 'games':
        return <GamesPage onNavigate={handleNavigate} />;
      case 'posts':
        return <PostsPage />;
      case 'reviews':
        return <ReviewsPage />;
      case 'wiki':
        return <WikiPage articleId={pageData} />;
      case 'profile':
        return <ProfilePage />;
      case 'discussion':
        return <DiscussionPage key={refreshTrigger} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-900">
        <Navbar onNavigate={handleNavigate} currentPage={currentPage} onCodeVerified={handleCodeVerified} />
        <main>{renderPage()}</main>
      </div>
    </AuthProvider>
  );
}

export default App;

import { Search, User, LogOut, Menu, X, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import { CodeAccessModal } from './CodeAccessModal';

type NavbarProps = {
  onNavigate: (page: string) => void;
  currentPage: string;
  onCodeVerified?: () => void;
};

export const Navbar = ({ onNavigate, currentPage, onCodeVerified }: NavbarProps) => {
  const { user, profile, language, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [codeModalOpen, setCodeModalOpen] = useState(false);

  const t = {
    ar: {
      home: 'الرئيسية',
      games: 'الألعاب',
      posts: 'المنشورات',
      reviews: 'المراجعات',
      discussion: 'النقاش',
      wiki: 'الموسوعة',
      search: 'بحث...',
      signIn: 'تسجيل الدخول',
      signUp: 'إنشاء حساب',
      profile: 'الملف الشخصي',
      signOut: 'تسجيل الخروج',
    },
    en: {
      home: 'Home',
      games: 'Games',
      posts: 'Posts',
      reviews: 'Reviews',
      discussion: 'Discussion',
      wiki: 'Wiki',
      search: 'Search...',
      signIn: 'Sign In',
      signUp: 'Sign Up',
      profile: 'Profile',
      signOut: 'Sign Out',
    },
  };

  const text = t[language as keyof typeof t] || t.en;

  const handleSignOut = async () => {
    await signOut();
    onNavigate('home');
  };

  return (
    <nav className={`bg-gray-900/95 backdrop-blur-sm border-b border-cyan-500/20 sticky top-0 z-50 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCodeModalOpen(true)}
              className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-cyan-400 transition-colors"
              title="Enter access code"
            >
              <Lock className="w-4 h-4" />
              <span className="text-sm">Code</span>
            </button>
            <button
              onClick={() => onNavigate('home')}
              className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent hover:scale-105 transition-transform"
            >
              IGRb
            </button>

            <div className="hidden md:flex items-center gap-1">
              {['home', 'games', 'posts', 'reviews', 'discussion', 'wiki'].map((page) => (
                <button
                  key={page}
                  onClick={() => onNavigate(page)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    currentPage === page
                      ? 'bg-cyan-500/20 text-cyan-400 shadow-lg shadow-cyan-500/20'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {text[page as keyof typeof text]}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4 flex-1 max-w-md mx-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={text.search}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
              />
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user && profile ? (
              <>
                <button
                  onClick={() => onNavigate('profile')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                >
                  <User className="w-5 h-5 text-cyan-400" />
                  <span className="text-white">{profile.username}</span>
                  <span className="text-xs text-purple-400">Lv.{profile.level}</span>
                </button>
                <button
                  onClick={handleSignOut}
                  className="p-2 rounded-lg bg-gray-800 hover:bg-red-500/20 text-gray-300 hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onNavigate('signin')}
                  className="px-4 py-2 rounded-lg text-white hover:bg-gray-800 transition-colors"
                >
                  {text.signIn}
                </button>
                <button
                  onClick={() => onNavigate('signup')}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
                >
                  {text.signUp}
                </button>
              </>
            )}
          </div>

          <button
            className="md:hidden text-white p-2"
            onClick={() => setCodeModalOpen(true)}
          >
            <Lock className="w-5 h-5" />
          </button>

          <button
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <CodeAccessModal isOpen={codeModalOpen} onClose={() => setCodeModalOpen(false)} onCodeVerified={onCodeVerified} />

      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-800/95 backdrop-blur-sm border-t border-gray-700">
          <div className="px-4 py-3 space-y-2">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={text.search}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400"
              />
            </div>
            {['home', 'games', 'posts', 'reviews', 'discussion', 'wiki'].map((page) => (
              <button
                key={page}
                onClick={() => {
                  onNavigate(page);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-2 rounded-lg ${
                  currentPage === page ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-300'
                }`}
              >
                {text[page as keyof typeof text]}
              </button>
            ))}
            <div className="border-t border-gray-700 pt-2 mt-2">
              {user && profile ? (
                <>
                  <button
                    onClick={() => {
                      onNavigate('profile');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 rounded-lg text-white hover:bg-gray-700"
                  >
                    {text.profile}
                  </button>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 rounded-lg text-red-400 hover:bg-gray-700"
                  >
                    {text.signOut}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      onNavigate('signin');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 rounded-lg text-white hover:bg-gray-700"
                  >
                    {text.signIn}
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('signup');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 text-white"
                  >
                    {text.signUp}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
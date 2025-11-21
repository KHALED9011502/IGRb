import { useEffect, useState } from 'react';
import { Star, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Game } from '../lib/supabase';

type GamesPageProps = {
  onNavigate: (page: string, id?: string) => void;
};

export const GamesPage = ({ onNavigate }: GamesPageProps) => {
  const { language } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const t = {
    ar: {
      title: 'جميع الألعاب',
      search: 'البحث عن لعبة...',
      noData: 'لا توجد ألعاب',
    },
    en: {
      title: 'All Games',
      search: 'Search for a game...',
      noData: 'No games available',
    },
  };

  const text = t[language as keyof typeof t] || t.en;

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    const { data } = await supabase
      .from('games')
      .select('*')
      .order('average_rating', { ascending: false });
    if (data) setGames(data);
  };

  const filteredGames = games.filter((game) => {
    const titleAr = game.title_ar.toLowerCase();
    const titleEn = game.title_en.toLowerCase();
    const query = searchQuery.toLowerCase();
    return titleAr.includes(query) || titleEn.includes(query);
  });

  return (
    <div className={`max-w-7xl mx-auto px-4 py-8 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <h1 className="text-4xl font-bold text-white mb-8">{text.title}</h1>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={text.search}
          className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredGames.length > 0 ? (
          filteredGames.map((game) => (
            <button
              key={game.id}
              onClick={() => onNavigate('game', game.id)}
              className="group relative h-80 rounded-xl overflow-hidden bg-gray-800 hover:scale-105 transition-transform"
            >
              {game.thumbnail_url && (
                <img
                  src={game.thumbnail_url}
                  alt={language === 'ar' ? game.title_ar : game.title_en}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                  {language === 'ar' ? game.title_ar : game.title_en}
                </h3>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-white font-medium">{game.average_rating.toFixed(1)}</span>
                  <span className="text-gray-400 text-sm">({game.total_ratings})</span>
                </div>
              </div>
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-cyan-500/50 rounded-xl transition-colors"></div>
            </button>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-400">{text.noData}</div>
        )}
      </div>
    </div>
  );
};
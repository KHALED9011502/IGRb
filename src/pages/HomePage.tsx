import { useEffect, useState } from 'react';
import { TrendingUp, MessageSquare, Star, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Game, Post, Review } from '../lib/supabase';

type HomePageProps = {
  onNavigate: (page: string, id?: string) => void;
};

export const HomePage = ({ onNavigate }: HomePageProps) => {
  const { language } = useAuth();
  const [trendingGames, setTrendingGames] = useState<Game[]>([]);
  const [latestPosts, setLatestPosts] = useState<Post[]>([]);
  const [latestReviews, setLatestReviews] = useState<Review[]>([]);

  const t = {
    ar: {
      hero: 'موسوعة الألعاب العربية',
      heroDesc: 'اكتشف، شارك، وتواصل مع مجتمع الألعاب العربي',
      search: 'ابحث عن لعبة...',
      trending: 'الألعاب الرائجة',
      latestPosts: 'أحدث المنشورات',
      latestReviews: 'أحدث المراجعات',
      viewAll: 'عرض الكل',
      categories: 'الفئات',
      action: 'حركة',
      rpg: 'آر بي جي',
      strategy: 'استراتيجية',
      sports: 'رياضة',
      noData: 'لا توجد بيانات',
    },
    en: {
      hero: 'Arabic Gaming Encyclopedia',
      heroDesc: 'Discover, share, and connect with the Arab gaming community',
      search: 'Search for a game...',
      trending: 'Trending Games',
      latestPosts: 'Latest Posts',
      latestReviews: 'Latest Reviews',
      viewAll: 'View All',
      categories: 'Categories',
      action: 'Action',
      rpg: 'RPG',
      strategy: 'Strategy',
      sports: 'Sports',
      noData: 'No data available',
    },
  };

  const text = t[language as keyof typeof t] || t.en;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: games } = await supabase
      .from('games')
      .select('*')
      .order('total_ratings', { ascending: false })
      .limit(6);
    if (games) setTrendingGames(games);

    const { data: posts } = await supabase
      .from('posts')
      .select('*, author:profiles(*), game:games(*)')
      .order('created_at', { ascending: false })
      .limit(3);
    if (posts) setLatestPosts(posts);

    const { data: reviews } = await supabase
      .from('reviews')
      .select('*, author:profiles(*), game:games(*)')
      .order('created_at', { ascending: false })
      .limit(3);
    if (reviews) setLatestReviews(reviews);
  };

  return (
    <div className={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="relative h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-purple-500/10 to-gray-900"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-500/20 via-transparent to-transparent"></div>

        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-pulse">
            {text.hero}
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            {text.heroDesc}
          </p>
          <div className="max-w-2xl mx-auto relative">
            <input
              type="text"
              placeholder={text.search}
              className="w-full px-6 py-4 bg-gray-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 text-lg"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-cyan-500 to-purple-600 px-6 py-2 rounded-full text-white font-medium hover:shadow-lg hover:shadow-cyan-500/50 transition-all">
              {text.search.split('...')[0]}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-cyan-400" />
              <h2 className="text-3xl font-bold text-white">{text.trending}</h2>
            </div>
            <button
              onClick={() => onNavigate('games')}
              className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              {text.viewAll}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingGames.length > 0 ? trendingGames.map((game) => (
              <button
                key={game.id}
                onClick={() => onNavigate('game', game.id)}
                className="group relative h-64 rounded-xl overflow-hidden bg-gray-800 hover:scale-105 transition-transform"
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
                  <h3 className="text-xl font-bold text-white mb-2">
                    {language === 'ar' ? game.title_ar : game.title_en}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="text-white">{game.average_rating.toFixed(1)}</span>
                    <span className="text-gray-400">({game.total_ratings})</span>
                  </div>
                </div>
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-cyan-500/50 rounded-xl transition-colors"></div>
              </button>
            )) : (
              <div className="col-span-3 text-center text-gray-400 py-12">{text.noData}</div>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-purple-400" />
              <h2 className="text-3xl font-bold text-white">{text.latestPosts}</h2>
            </div>
            <button
              onClick={() => onNavigate('posts')}
              className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
            >
              {text.viewAll}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestPosts.length > 0 ? latestPosts.map((post) => (
              <div
                key={post.id}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-purple-500/50 transition-colors cursor-pointer"
              >
                <h3 className="text-xl font-bold text-white mb-3 line-clamp-2">{post.title}</h3>
                <p className="text-gray-400 mb-4 line-clamp-3">{post.content}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    {post.author?.username || 'Unknown'}
                  </span>
                  <span className="text-gray-500">
                    {new Date(post.created_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                  </span>
                </div>
              </div>
            )) : (
              <div className="col-span-3 text-center text-gray-400 py-12">{text.noData}</div>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Star className="w-8 h-8 text-yellow-400" />
              <h2 className="text-3xl font-bold text-white">{text.latestReviews}</h2>
            </div>
            <button
              onClick={() => onNavigate('reviews')}
              className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors"
            >
              {text.viewAll}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestReviews.length > 0 ? latestReviews.map((review) => (
              <div
                key={review.id}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-yellow-500/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <h3 className="text-xl font-bold text-white mb-3 line-clamp-2">{review.title}</h3>
                <p className="text-gray-400 mb-4 line-clamp-3">{review.content}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    {review.author?.username || 'Unknown'}
                  </span>
                  <span className="text-gray-500">
                    {new Date(review.created_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                  </span>
                </div>
              </div>
            )) : (
              <div className="col-span-3 text-center text-gray-400 py-12">{text.noData}</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
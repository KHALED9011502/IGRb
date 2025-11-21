import { useEffect, useState } from 'react';
import { Star, Calendar, Cpu, Gamepad2, MessageSquare, FileText, Image, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Game, Post, Review, WikiArticle } from '../lib/supabase';

type GamePageProps = {
  gameId: string;
  onNavigate: (page: string, id?: string) => void;
};

export const GamePage = ({ gameId }: GamePageProps) => {
  const { language, user } = useAuth();
  const [game, setGame] = useState<Game | null>(null);
  const [activeTab, setActiveTab] = useState('wiki');
  const [posts, setPosts] = useState<Post[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [wikiArticles, setWikiArticles] = useState<WikiArticle[]>([]);

  const t = {
    ar: {
      wiki: 'الموسوعة',
      posts: 'المنشورات',
      reviews: 'المراجعات',
      media: 'الوسائط',
      discussion: 'النقاشات',
      releaseDate: 'تاريخ الإصدار',
      developer: 'المطور',
      platforms: 'المنصات',
      rating: 'التقييم',
      addReview: 'أضف مراجعة',
      createPost: 'إنشاء منشور',
      noData: 'لا توجد بيانات',
    },
    en: {
      wiki: 'Wiki',
      posts: 'Posts',
      reviews: 'Reviews',
      media: 'Media',
      discussion: 'Discussion',
      releaseDate: 'Release Date',
      developer: 'Developer',
      platforms: 'Platforms',
      rating: 'Rating',
      addReview: 'Add Review',
      createPost: 'Create Post',
      noData: 'No data available',
    },
  };

  const text = t[language as keyof typeof t] || t.en;

  useEffect(() => {
    loadGameData();
  }, [gameId]);

  const loadGameData = async () => {
    const { data: gameData } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .maybeSingle();
    if (gameData) setGame(gameData);

    const { data: postsData } = await supabase
      .from('posts')
      .select('*, author:profiles(*)')
      .eq('game_id', gameId)
      .order('created_at', { ascending: false });
    if (postsData) setPosts(postsData);

    const { data: reviewsData } = await supabase
      .from('reviews')
      .select('*, author:profiles(*)')
      .eq('game_id', gameId)
      .order('created_at', { ascending: false });
    if (reviewsData) setReviews(reviewsData);

    const { data: wikiData } = await supabase
      .from('wiki_articles')
      .select('*, author:profiles(*)')
      .eq('game_id', gameId)
      .order('created_at', { ascending: false });
    if (wikiData) setWikiArticles(wikiData);
  };

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  const tabs = [
    { id: 'wiki', label: text.wiki, icon: FileText },
    { id: 'posts', label: text.posts, icon: MessageSquare },
    { id: 'reviews', label: text.reviews, icon: Star },
    { id: 'media', label: text.media, icon: Image },
    { id: 'discussion', label: text.discussion, icon: Users },
  ];

  return (
    <div className={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="relative h-96 overflow-hidden">
        {game.banner_url && (
          <img
            src={game.banner_url}
            alt={language === 'ar' ? game.title_ar : game.title_en}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-5xl font-bold text-white mb-4">
              {language === 'ar' ? game.title_ar : game.title_en}
            </h1>
            <div className="flex items-center gap-6 text-gray-300">
              <div className="flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                <span className="text-2xl font-bold text-white">{game.average_rating.toFixed(1)}</span>
                <span className="text-gray-400">({game.total_ratings})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className="flex gap-2 mb-6 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                      : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="space-y-6">
              {activeTab === 'wiki' && (
                <div>
                  {wikiArticles.length > 0 ? (
                    wikiArticles.map((article) => (
                      <div key={article.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-4">
                        <h3 className="text-2xl font-bold text-white mb-4">
                          {language === 'ar' ? article.title_ar : article.title_en}
                        </h3>
                        <div className="text-gray-300 prose prose-invert max-w-none">
                          {language === 'ar' ? article.content_ar : article.content_en}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-400">{text.noData}</div>
                  )}
                </div>
              )}

              {activeTab === 'posts' && (
                <div>
                  {user && (
                    <button className="mb-6 px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all">
                      {text.createPost}
                    </button>
                  )}
                  {posts.length > 0 ? (
                    posts.map((post) => (
                      <div key={post.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-4">
                        <h3 className="text-xl font-bold text-white mb-3">{post.title}</h3>
                        <p className="text-gray-300 mb-4">{post.content}</p>
                        <div className="flex items-center justify-between text-sm text-gray-400">
                          <span>{post.author?.username}</span>
                          <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-400">{text.noData}</div>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div>
                  {user && (
                    <button className="mb-6 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-lg hover:shadow-lg transition-all">
                      {text.addReview}
                    </button>
                  )}
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <div key={review.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-4">
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
                        <h3 className="text-xl font-bold text-white mb-3">{review.title}</h3>
                        <p className="text-gray-300 mb-4">{review.content}</p>
                        <div className="flex items-center justify-between text-sm text-gray-400">
                          <span>{review.author?.username}</span>
                          <span>{new Date(review.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-400">{text.noData}</div>
                  )}
                </div>
              )}

              {activeTab === 'media' && (
                <div className="text-center py-12 text-gray-400">{text.noData}</div>
              )}

              {activeTab === 'discussion' && (
                <div className="text-center py-12 text-gray-400">{text.noData}</div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Game Info</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-cyan-400 mt-1" />
                  <div>
                    <div className="text-sm text-gray-400">{text.releaseDate}</div>
                    <div className="text-white">
                      {game.release_date ? new Date(game.release_date).toLocaleDateString() : 'TBA'}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Cpu className="w-5 h-5 text-purple-400 mt-1" />
                  <div>
                    <div className="text-sm text-gray-400">{text.developer}</div>
                    <div className="text-white">{game.developer || 'Unknown'}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Gamepad2 className="w-5 h-5 text-yellow-400 mt-1" />
                  <div>
                    <div className="text-sm text-gray-400">{text.platforms}</div>
                    <div className="text-white">{game.platforms.join(', ') || 'N/A'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
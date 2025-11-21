import { useEffect, useState } from 'react';
import { MessageSquare, TrendingUp, Clock, Filter } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Post } from '../lib/supabase';

export const PostsPage = () => {
  const { language, user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState<'newest' | 'popular'>('newest');

  const t = {
    ar: {
      title: 'منشورات المجتمع',
      newest: 'الأحدث',
      popular: 'الأكثر شعبية',
      createPost: 'إنشاء منشور',
      noData: 'لا توجد منشورات',
      filters: 'الفلاتر',
    },
    en: {
      title: 'Community Posts',
      newest: 'Newest',
      popular: 'Popular',
      createPost: 'Create Post',
      noData: 'No posts available',
      filters: 'Filters',
    },
  };

  const text = t[language as keyof typeof t] || t.en;

  useEffect(() => {
    loadPosts();
  }, [filter]);

  const loadPosts = async () => {
    const orderBy = filter === 'popular' ? 'likes_count' : 'created_at';
    const { data } = await supabase
      .from('posts')
      .select('*, author:profiles(*), game:games(*)')
      .order(orderBy, { ascending: false });
    if (data) setPosts(data);
  };

  return (
    <div className={`max-w-7xl mx-auto px-4 py-8 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-white">{text.title}</h1>
        {user && (
          <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all">
            {text.createPost}
          </button>
        )}
      </div>

      <div className="flex items-center gap-4 mb-6">
        <Filter className="w-5 h-5 text-gray-400" />
        <span className="text-gray-400">{text.filters}:</span>
        <button
          onClick={() => setFilter('newest')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            filter === 'newest'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
              : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          {text.newest}
        </button>
        <button
          onClick={() => setFilter('popular')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            filter === 'popular'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
              : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          {text.popular}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div
              key={post.id}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-purple-500/50 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {post.author?.username?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="text-white font-medium">{post.author?.username}</div>
                  <div className="text-xs text-gray-400">
                    {new Date(post.created_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                  </div>
                </div>
              </div>

              {post.game && (
                <div className="text-xs text-cyan-400 mb-2">
                  {language === 'ar' ? post.game.title_ar : post.game.title_en}
                </div>
              )}

              <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-purple-400 transition-colors">
                {post.title}
              </h3>
              <p className="text-gray-400 mb-4 line-clamp-3">{post.content}</p>

              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  {post.comments_count}
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  {post.likes_count}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-12 text-gray-400">{text.noData}</div>
        )}
      </div>
    </div>
  );
};
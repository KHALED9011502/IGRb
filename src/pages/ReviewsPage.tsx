import { useEffect, useState } from 'react';
import { Star, Filter } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Review } from '../lib/supabase';

export const ReviewsPage = () => {
  const { language } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<number | 'all'>('all');

  const t = {
    ar: {
      title: 'مراجعات الألعاب',
      all: 'الكل',
      filters: 'تصفية حسب التقييم',
      noData: 'لا توجد مراجعات',
    },
    en: {
      title: 'Game Reviews',
      all: 'All',
      filters: 'Filter by Rating',
      noData: 'No reviews available',
    },
  };

  const text = t[language as keyof typeof t] || t.en;

  useEffect(() => {
    loadReviews();
  }, [filter]);

  const loadReviews = async () => {
    let query = supabase
      .from('reviews')
      .select('*, author:profiles(*), game:games(*)')
      .order('created_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('rating', filter);
    }

    const { data } = await query;
    if (data) setReviews(data);
  };

  return (
    <div className={`max-w-7xl mx-auto px-4 py-8 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <h1 className="text-4xl font-bold text-white mb-8">{text.title}</h1>

      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <Filter className="w-5 h-5 text-gray-400" />
        <span className="text-gray-400">{text.filters}:</span>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition-all ${
            filter === 'all'
              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
              : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          {text.all}
        </button>
        {[5, 4, 3, 2, 1].map((rating) => (
          <button
            key={rating}
            onClick={() => setFilter(rating)}
            className={`flex items-center gap-1 px-4 py-2 rounded-lg transition-all ${
              filter === rating
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {rating}
            <Star className="w-4 h-4 fill-current" />
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div
              key={review.id}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-yellow-500/50 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {review.author?.username?.[0]?.toUpperCase()}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-white font-medium">{review.author?.username}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(review.created_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {review.game && (
                    <div className="text-sm text-cyan-400 mb-3">
                      {language === 'ar' ? review.game.title_ar : review.game.title_en}
                    </div>
                  )}

                  <h3 className="text-xl font-bold text-white mb-3">{review.title}</h3>
                  <p className="text-gray-300">{review.content}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-400">{text.noData}</div>
        )}
      </div>
    </div>
  );
};
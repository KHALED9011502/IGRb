import { useEffect, useState } from 'react';
import { Trophy, Star, MessageSquare, FileText, Award } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export const ProfilePage = () => {
  const { profile, language } = useAuth();
  const [stats, setStats] = useState({
    posts: 0,
    reviews: 0,
    wikiContributions: 0,
  });
  const [badges, setBadges] = useState<Array<{ name_ar: string; name_en: string; icon: string }>>([]);

  const t = {
    ar: {
      profile: 'الملف الشخصي',
      level: 'المستوى',
      xp: 'نقاط الخبرة',
      stats: 'الإحصائيات',
      posts: 'المنشورات',
      reviews: 'المراجعات',
      wikiContributions: 'مساهمات الموسوعة',
      badges: 'الأوسمة',
      bio: 'النبذة الشخصية',
      noBio: 'لم يتم إضافة نبذة شخصية',
      noBadges: 'لا توجد أوسمة',
    },
    en: {
      profile: 'Profile',
      level: 'Level',
      xp: 'XP',
      stats: 'Statistics',
      posts: 'Posts',
      reviews: 'Reviews',
      wikiContributions: 'Wiki Contributions',
      badges: 'Badges',
      bio: 'Bio',
      noBio: 'No bio added',
      noBadges: 'No badges earned yet',
    },
  };

  const text = t[language as keyof typeof t] || t.en;

  useEffect(() => {
    if (profile) {
      loadStats();
      loadBadges();
    }
  }, [profile]);

  const loadStats = async () => {
    if (!profile) return;

    const [postsResult, reviewsResult, wikiResult] = await Promise.all([
      supabase.from('posts').select('id', { count: 'exact' }).eq('author_id', profile.id),
      supabase.from('reviews').select('id', { count: 'exact' }).eq('author_id', profile.id),
      supabase.from('wiki_articles').select('id', { count: 'exact' }).eq('author_id', profile.id),
    ]);

    setStats({
      posts: postsResult.count || 0,
      reviews: reviewsResult.count || 0,
      wikiContributions: wikiResult.count || 0,
    });
  };

  const loadBadges = async () => {
    if (!profile) return;

    const { data } = await supabase
      .from('user_badges')
      .select('badge_id, badges(*)')
      .eq('user_id', profile.id);

    if (data) {
      setBadges(data.map((item: { badges: { name_ar: string; name_en: string; icon: string } }) => item.badges));
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  const xpProgress = (profile.xp % 100) / 100;

  return (
    <div className={`max-w-7xl mx-auto px-4 py-8 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex justify-center mb-4">
              <div className="w-32 h-32 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                {profile.username[0].toUpperCase()}
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white text-center mb-2">{profile.username}</h2>

            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-lg">
                <Trophy className="w-5 h-5 text-purple-400" />
                <span className="text-white font-bold">{text.level} {profile.level}</span>
              </div>
            </div>

            <div className="mb-2">
              <div className="flex justify-between text-sm text-gray-400 mb-1">
                <span>{text.xp}</span>
                <span>{profile.xp} / {profile.level * 100}</span>
              </div>
              <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-purple-600 transition-all duration-500"
                  style={{ width: `${xpProgress * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">{text.bio}</h3>
            <p className="text-gray-300">{profile.bio || text.noBio}</p>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <h3 className="text-2xl font-bold text-white mb-6">{text.stats}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/30 rounded-xl p-6">
                <MessageSquare className="w-8 h-8 text-purple-400 mb-3" />
                <div className="text-3xl font-bold text-white mb-1">{stats.posts}</div>
                <div className="text-sm text-gray-400">{text.posts}</div>
              </div>

              <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border border-yellow-500/30 rounded-xl p-6">
                <Star className="w-8 h-8 text-yellow-400 mb-3" />
                <div className="text-3xl font-bold text-white mb-1">{stats.reviews}</div>
                <div className="text-sm text-gray-400">{text.reviews}</div>
              </div>

              <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/30 rounded-xl p-6">
                <FileText className="w-8 h-8 text-cyan-400 mb-3" />
                <div className="text-3xl font-bold text-white mb-1">{stats.wikiContributions}</div>
                <div className="text-sm text-gray-400">{text.wikiContributions}</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Award className="w-6 h-6 text-yellow-400" />
              <h3 className="text-2xl font-bold text-white">{text.badges}</h3>
            </div>

            {badges.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {badges.map((badge, i) => (
                  <div
                    key={i}
                    className="bg-gradient-to-br from-yellow-500/10 to-orange-500/5 border border-yellow-500/30 rounded-xl p-4 text-center"
                  >
                    <div className="text-4xl mb-2">{badge.icon || '🏆'}</div>
                    <div className="text-sm text-white font-medium">
                      {language === 'ar' ? badge.name_ar : badge.name_en}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">{text.noBadges}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
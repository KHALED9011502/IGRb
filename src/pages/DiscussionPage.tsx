import { useEffect, useState } from 'react';
import { MessageSquare, Edit2, Trash2, X, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface DiscussionPost {
  id: string;
  title: string;
  content: string;
  platforms: string[];
  author_id: string;
  game_id?: string;
  created_at: string;
  updated_at: string;
  comments_count: number;
  today_comments: number;
  author?: { username: string };
  game?: { title_ar: string; title_en: string };
}

interface UserRole {
  is_admin: boolean;
  can_post: boolean;
}

export const DiscussionPage = () => {
  const { user, language } = useAuth();
  const [posts, setPosts] = useState<DiscussionPost[]>([]);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPost, setEditingPost] = useState<DiscussionPost | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    platforms: [] as string[],
  });
  const [loading, setLoading] = useState(false);

  const t = {
    ar: {
      title: 'منطقة النقاش',
      createPost: 'إنشاء منشور',
      noPerm: 'أدخل رمز الوصول لإنشاء منشورات',
      signIn: 'سجل الدخول أولاً',
      postTitle: 'عنوان المنشور',
      content: 'المحتوى',
      platforms: 'المنصات (PC, PS5, iOS, Android)',
      save: 'حفظ',
      cancel: 'إلغاء',
      edit: 'تعديل',
      delete: 'حذف',
      today: 'اليوم',
      comments: 'تعليقات',
      noData: 'لا توجد منشورات',
      confirmDelete: 'هل أنت متأكد من حذف هذا المنشور؟',
      editPost: 'تعديل المنشور',
      newPost: 'منشور جديد',
    },
    en: {
      title: 'Discussion',
      createPost: 'Create Post',
      noPerm: 'Enter access code to create posts',
      signIn: 'Sign in first',
      postTitle: 'Post Title',
      content: 'Content',
      platforms: 'Platforms (PC, PS5, iOS, Android)',
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      today: 'today',
      comments: 'comments',
      noData: 'No posts available',
      confirmDelete: 'Are you sure you want to delete this post?',
      editPost: 'Edit Post',
      newPost: 'New Post',
    },
  };

  const text = t[language as keyof typeof t] || t.en;
  const platformOptions = ['PC', 'PS5', 'PS4', 'Xbox One', 'iOS', 'Android', 'Nintendo Switch'];

  useEffect(() => {
    loadPosts();
    if (user) {
      loadUserRole();
    }
  }, [user]);

  const loadPosts = async () => {
    const { data } = await supabase
      .from('discussion_posts')
      .select('*, author:profiles(username)')
      .order('created_at', { ascending: false });
    if (data) setPosts(data);
  };

  const loadUserRole = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('user_roles')
      .select('is_admin, can_post')
      .eq('user_id', user.id)
      .maybeSingle();
    setUserRole(data || { is_admin: false, can_post: false });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingPost) {
        await supabase
          .from('discussion_posts')
          .update({
            title: formData.title,
            content: formData.content,
            platforms: formData.platforms,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingPost.id);
      } else {
        await supabase.from('discussion_posts').insert({
          title: formData.title,
          content: formData.content,
          platforms: formData.platforms,
          author_id: user?.id,
          language,
        });
      }

      setFormData({ title: '', content: '', platforms: [] });
      setEditingPost(null);
      setShowCreateForm(false);
      loadPosts();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm(text.confirmDelete)) return;

    try {
      await supabase.from('discussion_posts').delete().eq('id', postId);
      loadPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (post: DiscussionPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      platforms: post.platforms,
    });
    setShowCreateForm(true);
  };

  const canCreatePost = user && userRole?.can_post;
  const canDeletePost = (post: DiscussionPost) => user && (userRole?.is_admin || post.author_id === user.id);

  return (
    <div className={`max-w-5xl mx-auto px-4 py-8 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-white">{text.title}</h1>
        {user ? (
          canCreatePost ? (
            <button
              onClick={() => {
                setEditingPost(null);
                setFormData({ title: '', content: '', platforms: [] });
                setShowCreateForm(!showCreateForm);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all"
            >
              <Plus className="w-5 h-5" />
              {text.createPost}
            </button>
          ) : (
            <div className="text-center">
              <p className="text-gray-400 text-sm">{text.noPerm}</p>
            </div>
          )
        ) : (
          <div className="text-center">
            <p className="text-gray-400 text-sm">{text.signIn}</p>
          </div>
        )}
      </div>

      {showCreateForm && (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">
              {editingPost ? text.editPost : text.newPost}
            </h2>
            <button
              onClick={() => {
                setShowCreateForm(false);
                setEditingPost(null);
              }}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {text.postTitle}
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {text.content}
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={5}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {text.platforms}
              </label>
              <div className="flex flex-wrap gap-3">
                {platformOptions.map((platform) => (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => {
                      const newPlatforms = formData.platforms.includes(platform)
                        ? formData.platforms.filter((p) => p !== platform)
                        : [...formData.platforms, platform];
                      setFormData({ ...formData, platforms: newPlatforms });
                    }}
                    className={`px-4 py-2 rounded-full border-2 transition-all ${
                      formData.platforms.includes(platform)
                        ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300'
                        : 'border-gray-700 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    {platform}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50"
              >
                {loading ? '...' : text.save}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingPost(null);
                }}
                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
              >
                {text.cancel}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-6">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div
              key={post.id}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-purple-500/50 transition-all"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2">{post.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                    <span>{post.author?.username}</span>
                    <span>
                      {new Date(post.created_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                    </span>
                  </div>
                </div>

                {user && (post.author_id === user.id || userRole?.is_admin) && (
                  <div className="flex gap-2">
                    {post.author_id === user.id && (
                      <button
                        onClick={() => handleEdit(post)}
                        className="p-2 hover:bg-blue-500/20 rounded-lg text-blue-400 transition-colors"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                    )}
                    {canDeletePost(post) && (
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {post.platforms.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.platforms.map((platform) => (
                    <span
                      key={platform}
                      className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-xs font-medium border border-cyan-500/30"
                    >
                      {platform}
                    </span>
                  ))}
                </div>
              )}

              <p className="text-gray-300 mb-6 whitespace-pre-wrap">{post.content}</p>

              <div className="flex gap-6 text-gray-400">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>
                    {post.today_comments} {text.today}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>
                    {post.comments_count} {text.comments}
                  </span>
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
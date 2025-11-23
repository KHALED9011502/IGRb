import { useState } from 'react';
import { X, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

type CodeAccessModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCodeVerified?: () => void;
};

export const CodeAccessModal = ({ isOpen, onClose, onCodeVerified }: CodeAccessModalProps) => {
  const { user, language } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const t = {
    ar: {
      title: 'إدخال رمز الوصول',
      description: 'أدخل رمز الوصول لفتح المزيد من الميزات',
      code: 'الرمز',
      submit: 'تحقق',
      close: 'إغلاق',
      invalidCode: 'رمز غير صحيح',
      success: 'تم التفعيل بنجاح',
      adminSuccess: 'تم تفعيل صلاحيات الإدارة',
      postingSuccess: 'تم تفعيل إمكانية النشر',
      signInRequired: 'يجب تسجيل الدخول أولاً',
    },
    en: {
      title: 'Enter Access Code',
      description: 'Enter an access code to unlock more features',
      code: 'Code',
      submit: 'Verify',
      close: 'Close',
      invalidCode: 'Invalid code',
      success: 'Activated successfully',
      adminSuccess: 'Admin privileges activated',
      postingSuccess: 'Posting enabled',
      signInRequired: 'Please sign in first',
    },
  };

  const text = t[language as keyof typeof t] || t.en;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!user) {
      setError(text.signInRequired);
      setLoading(false);
      return;
    }

    try {
      const postingCode = '9011502';
      const adminCode = '55804677';

      if (code === postingCode || code === adminCode) {
        const { data: existingRole, error: selectError } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (selectError && selectError.code !== 'PGRST116') {
          console.error('Select error:', selectError);
          setError(text.invalidCode);
          setLoading(false);
          return;
        }

        if (code === adminCode) {
          if (existingRole) {
            const { error: updateError } = await supabase
              .from('user_roles')
              .update({ is_admin: true, can_post: true })
              .eq('user_id', user.id);
            if (updateError) {
              console.error('Update error:', updateError);
              setError(text.invalidCode);
              setLoading(false);
              return;
            }
          } else {
            const { error: insertError } = await supabase.from('user_roles').insert({
              user_id: user.id,
              is_admin: true,
              can_post: true,
            });
            if (insertError) {
              console.error('Insert error:', insertError);
              setError(text.invalidCode);
              setLoading(false);
              return;
            }
          }
          setSuccess(text.adminSuccess);
        } else if (code === postingCode) {
          if (existingRole) {
            const { error: updateError } = await supabase
              .from('user_roles')
              .update({ can_post: true })
              .eq('user_id', user.id);
            if (updateError) {
              console.error('Update error:', updateError);
              setError(text.invalidCode);
              setLoading(false);
              return;
            }
          } else {
            const { error: insertError } = await supabase.from('user_roles').insert({
              user_id: user.id,
              can_post: true,
            });
            if (insertError) {
              console.error('Insert error:', insertError);
              setError(text.invalidCode);
              setLoading(false);
              return;
            }
          }
          setSuccess(text.postingSuccess);
        }

        setCode('');
        if (onCodeVerified) {
          onCodeVerified();
        }
        setTimeout(() => onClose(), 1500);
      } else {
        setError(text.invalidCode);
      }
    } catch (err) {
      console.error('Error:', err);
      setError(text.invalidCode);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`bg-gray-800/95 backdrop-blur-sm border border-cyan-500/30 rounded-2xl max-w-md w-full p-8 shadow-2xl shadow-cyan-500/10 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Lock className="w-6 h-6 text-cyan-400" />
            <h2 className="text-2xl font-bold text-white">{text.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <p className="text-gray-300 mb-6">{text.description}</p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {text.code}
            </label>
            <input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-center text-lg tracking-widest"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading || !code}
              className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '...' : text.submit}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
            >
              {text.close}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
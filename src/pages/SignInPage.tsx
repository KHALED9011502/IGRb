import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn } from 'lucide-react';

type SignInPageProps = {
  onNavigate: (page: string) => void;
};

export const SignInPage = ({ onNavigate }: SignInPageProps) => {
  const { signIn, language } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const t = {
    ar: {
      title: 'تسجيل الدخول',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      signIn: 'دخول',
      noAccount: 'ليس لديك حساب؟',
      signUp: 'إنشاء حساب',
      error: 'خطأ في البريد الإلكتروني أو كلمة المرور',
    },
    en: {
      title: 'Sign In',
      email: 'Email',
      password: 'Password',
      signIn: 'Sign In',
      noAccount: "Don't have an account?",
      signUp: 'Sign Up',
      error: 'Invalid email or password',
    },
  };

  const text = t[language as keyof typeof t] || t.en;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      onNavigate('home');
    } catch (err) {
      setError(text.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-[calc(100vh-64px)] flex items-center justify-center px-4 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="max-w-md w-full">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-8 shadow-2xl shadow-cyan-500/10">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-cyan-500/20 to-purple-600/20 rounded-full">
              <LogIn className="w-12 h-12 text-cyan-400" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-center text-white mb-8">{text.title}</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {text.email}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {text.password}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '...' : text.signIn}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-gray-400">{text.noAccount} </span>
            <button
              onClick={() => onNavigate('signup')}
              className="text-cyan-400 hover:text-cyan-300 font-medium"
            >
              {text.signUp}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
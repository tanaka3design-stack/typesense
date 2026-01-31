import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { toast } from 'sonner';
import { supabase, kvStore } from '@/utils/supabase/client';

interface AuthProps {
  onAuthSuccess: (userId: string, name: string, accessToken: string) => void;
}

export function Auth({ onAuthSuccess }: AuthProps) {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !name) {
      toast.error('すべてのフィールドを入力してください');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Creating user with email:', email);
      
      // Create user with Supabase Auth (client-side)
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
          emailRedirectTo: undefined, // Auto-confirm email
        }
      });

      if (signUpError) {
        console.error('Sign up error:', signUpError);
        
        // Translate common error messages to Japanese
        let errorMessage = signUpError.message;
        
        if (errorMessage.includes('already been registered') || errorMessage.includes('already exists')) {
          errorMessage = 'このメールアドレスは既に登録されています。ログインしてください。';
        }
        
        throw new Error(errorMessage);
      }

      if (!signUpData.user) {
        throw new Error('ユーザー作成に失敗しました');
      }

      const userId = signUpData.user.id;
      const accessToken = signUpData.session?.access_token;

      console.log('User created successfully:', userId);

      // Store user profile in KV store
      await kvStore.set(`user:${userId}`, {
        id: userId,
        name,
        email,
        created_at: new Date().toISOString()
      });

      console.log('User profile stored in KV');

      if (!accessToken) {
        throw new Error('認証トークンの取得に失敗しました');
      }

      toast.success('アカウントを作成しました！');
      onAuthSuccess(userId, name, accessToken);
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'サインアップに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('メールアドレスとパスワードを入力してください');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Signing in with email:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        throw new Error(error.message);
      }

      const accessToken = data.session?.access_token;
      const userId = data.user?.id;

      if (!accessToken || !userId) {
        throw new Error('ログインに失敗しました');
      }

      console.log('Signed in successfully:', userId);

      // Get user profile from KV store
      const userProfile = await kvStore.get(`user:${userId}`);

      let userName = name;
      
      if (userProfile) {
        userName = userProfile.name;
        console.log('User profile found:', userName);
      } else {
        // Fallback to user metadata
        userName = data.user?.user_metadata?.name || data.user?.email?.split('@')[0] || '名無し';
        console.log('Using fallback username:', userName);
      }

      toast.success('ログインしました！');
      onAuthSuccess(userId, userName, accessToken);
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'ログインに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-green-600 mb-2" style={{ letterSpacing: '0.3em', fontFamily: "'Cormorant', serif" }}>
            TypeSense
          </h1>
          <p className="text-gray-500 text-sm">感情で文字組が変わる投稿アプリ</p>
        </div>

        <div className="bg-white shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.9)] rounded-2xl p-8">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setIsSignup(false)}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                !isSignup
                  ? 'bg-gradient-to-br from-green-400 to-green-500 text-white shadow-[4px_4px_8px_rgba(0,0,0,0.1)]'
                  : 'text-gray-500 hover:text-green-500'
              }`}
            >
              ログイン
            </button>
            <button
              onClick={() => setIsSignup(true)}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                isSignup
                  ? 'bg-gradient-to-br from-green-400 to-green-500 text-white shadow-[4px_4px_8px_rgba(0,0,0,0.1)]'
                  : 'text-gray-500 hover:text-green-500'
              }`}
            >
              新規登録
            </button>
          </div>

          <form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-4">
            {isSignup && (
              <div>
                <Label htmlFor="name" className="text-sm text-gray-700">
                  名前
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="山田太郎"
                  className="mt-1 bg-white border-2 border-gray-200 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.06),inset_-4px_-4px_8px_rgba(255,255,255,0.9)] focus:border-green-300 focus:ring-0"
                  required
                />
              </div>
            )}

            <div>
              <Label htmlFor="email" className="text-sm text-gray-700">
                メールアドレス
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="mt-1 bg-white border-2 border-gray-200 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.06),inset_-4px_-4px_8px_rgba(255,255,255,0.9)] focus:border-green-300 focus:ring-0"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-sm text-gray-700">
                パスワード
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 bg-white border-2 border-gray-200 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.06),inset_-4px_-4px_8px_rgba(255,255,255,0.9)] focus:border-green-300 focus:ring-0"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-br from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white shadow-[6px_6px_12px_rgba(0,0,0,0.1),-6px_-6px_12px_rgba(255,255,255,0.9)] border-0 font-semibold"
            >
              {isLoading ? '処理中...' : isSignup ? '新規登録' : 'ログイン'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';

interface UsernameSetupProps {
  onSubmit: (username: string) => void;
}

export function UsernameSetup({ onSubmit }: UsernameSetupProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-[9px_9px_16px_rgba(0,0,0,0.1),-9px_-9px_16px_rgba(255,255,255,0.9)] border-0 bg-white">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl mb-2">TypeSense へようこそ！</CardTitle>
          <CardDescription>
            感情で文字組が変わる投稿アプリです。<br />
            まずはユーザー名を設定しましょう。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">ユーザー名</Label>
              <Input
                id="username"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: タロウ"
                className="mt-1"
                maxLength={20}
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">
                この名前で投稿されます（後から変更可能）
              </p>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-br from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white shadow-[6px_6px_12px_rgba(0,0,0,0.1),-6px_-6px_12px_rgba(255,255,255,0.9)] border-0"
              disabled={!name.trim()}
            >
              はじめる
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
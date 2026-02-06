import { useState, useEffect } from 'react';
import { Heart, Plus, X } from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { useUser } from '@/app/contexts/UserContext';
import { kvStore } from '/utils/supabase/client';

interface Reaction {
  emoji: string;
  count: number;
  users: string[];
}

interface PostReactionsProps {
  postId: string;
}

// カテゴリー別絵文字リスト
const REACTION_CATEGORIES = {
  'ポジティブ': ['😊', '😄', '🥰', '😍', '🤗', '😆', '😁', '🤩', '✨', '💖', '💕', '💓', '🌟', '⭐', '🎉', '🎊'],
  '応援': ['👍', '👏', '💪', '🔥', '💯', '✅', '🙌', '👌', '💚', '❤️', '🧡', '💛'],
  'かわいい': ['🥺', '😻', '🐱', '🐶', '🐰', '🦊', '🐻', '🌸', '🌺', '🌷', '🌼', '💐'],
  'おもしろい': ['😂', '🤣', '😹', '🤪', '😜', '😝', '😎', '🤡', '👻', '🎃', '🍕', '🍔'],
  'すごい': ['😮', '😲', '🤯', '👀', '💡', '🚀', '🏆', '🥇', '👑', '💎', '⚡', '🌈'],
  '残念': ['😢', '😭', '😿', '💔', '😔', '😞', '🥲', '😓', '😪', '💤', '🌧️', '☁️'],
};

export function PostReactions({ postId }: PostReactionsProps) {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const user = useUser();

  useEffect(() => {
    loadReactions();
    
    // 5秒ごとにリアクションを再読み込み（リアルタイム更新）
    const interval = setInterval(() => {
      loadReactions();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [postId]);

  const loadReactions = async () => {
    try {
      const reactionKey = `reactions:${postId}`;
      const data = await kvStore.get(reactionKey);
      
      if (data && Array.isArray(data)) {
        setReactions(data);
      } else {
        setReactions([]);
      }
    } catch (error) {
      console.error('リアクションの読み込みエラー:', error);
      setReactions([]);
    }
  };

  const toggleReaction = async (emoji: string) => {
    if (!user.isAuthenticated || !user.userId) {
      alert('リアクションするにはログインが必要です');
      return;
    }

    try {
      const reactionKey = `reactions:${postId}`;
      const existingReaction = reactions.find(r => r.emoji === emoji);

      let newReactions: Reaction[];

      if (existingReaction) {
        // すでにリアクションが存在する
        const hasReacted = existingReaction.users.includes(user.userId);

        if (hasReacted) {
          // リアクションを削除
          const updatedUsers = existingReaction.users.filter(id => id !== user.userId);
          
          if (updatedUsers.length === 0) {
            // 誰もリアクションしていない場合は削除
            newReactions = reactions.filter(r => r.emoji !== emoji);
          } else {
            newReactions = reactions.map(r =>
              r.emoji === emoji
                ? { ...r, count: updatedUsers.length, users: updatedUsers }
                : r
            );
          }
        } else {
          // リアクションを追加
          newReactions = reactions.map(r =>
            r.emoji === emoji
              ? { ...r, count: r.count + 1, users: [...r.users, user.userId] }
              : r
          );
        }
      } else {
        // 新しいリアクションを追加
        newReactions = [
          ...reactions,
          { emoji, count: 1, users: [user.userId] }
        ];
      }

      // KVストアに保存
      await kvStore.set(reactionKey, newReactions);
      setReactions(newReactions);
      setShowPicker(false); // リアクション選択後にピッカーを閉じる
    } catch (error) {
      console.error('リアクションの保存エラー:', error);
    }
  };

  const hasUserReacted = (reaction: Reaction) => {
    return user.userId ? reaction.users.includes(user.userId) : false;
  };

  return (
    <>
      <div className="flex flex-wrap gap-2 items-center">
        {/* 既存のリアクション */}
        {reactions.map((reaction) => (
          <button
            key={reaction.emoji}
            onClick={() => toggleReaction(reaction.emoji)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
              transition-all duration-200
              ${hasUserReacted(reaction)
                ? 'bg-green-50 border-2 border-green-300 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.06)]'
                : 'bg-white border border-gray-200 shadow-[4px_4px_8px_rgba(0,0,0,0.08),-2px_-2px_6px_rgba(255,255,255,0.9)] hover:shadow-[6px_6px_12px_rgba(0,0,0,0.1)]'
              }
            `}
          >
            <span className="text-lg leading-none">{reaction.emoji}</span>
            <span className={hasUserReacted(reaction) ? 'text-green-700' : 'text-gray-600'}>
              {reaction.count}
            </span>
          </button>
        ))}

        {/* リアクション追加ボタン */}
        <button
          onClick={() => setShowPicker(true)}
          className="relative flex items-center justify-center gap-1 px-3 py-1.5 rounded-full bg-white border border-gray-200 shadow-[4px_4px_8px_rgba(0,0,0,0.08),-2px_-2px_6px_rgba(255,255,255,0.9)] hover:shadow-[6px_6px_12px_rgba(0,0,0,0.1)] hover:border-green-300 transition-all"
        >
          <Heart size={16} className="text-gray-400" />
          <Plus size={14} className="text-gray-400 absolute -top-0.5 -right-0.5" />
        </button>
      </div>

      {/* ボトムシート形式の絵文字ピッカー */}
      {showPicker && (
        <>
          {/* 背景オーバーレイ（ほぼ透明、投稿がよく見える） */}
          <div
            className="fixed inset-0 bg-black/10 z-40 transition-opacity"
            onClick={() => setShowPicker(false)}
          />
          
          {/* ボトムシート */}
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-[0_-8px_32px_rgba(0,0,0,0.2)] max-h-[70vh] overflow-y-auto animate-slide-up">
            {/* ヘッダー */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <div>
                <h3 className="text-lg font-bold text-gray-800">リアクションを選ぶ</h3>
                <p className="text-xs text-gray-500 mt-0.5">気持ちを絵文字で伝えよう！</p>
              </div>
              <button
                onClick={() => setShowPicker(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-all"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            {/* 絵文字カテゴリーリスト */}
            <div className="px-6 py-4 space-y-6 pb-8">
              {Object.entries(REACTION_CATEGORIES).map(([category, emojis]) => (
                <div key={category}>
                  <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-green-500 rounded-full"></span>
                    {category}
                  </h4>
                  <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                    {emojis.map((emoji) => {
                      const existingReaction = reactions.find(r => r.emoji === emoji);
                      const hasReacted = existingReaction && hasUserReacted(existingReaction);
                      
                      return (
                        <button
                          key={emoji}
                          onClick={() => toggleReaction(emoji)}
                          className={`
                            relative aspect-square flex flex-col items-center justify-center rounded-2xl text-3xl
                            transition-all duration-200 hover:scale-110
                            ${hasReacted
                              ? 'bg-green-50 border-2 border-green-300 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.06)]'
                              : 'bg-gray-50 hover:bg-gray-100 border border-gray-200 shadow-[2px_2px_6px_rgba(0,0,0,0.06)]'
                            }
                          `}
                        >
                          <span className="leading-none">{emoji}</span>
                          {existingReaction && existingReaction.count > 0 && (
                            <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                              hasReacted
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-400 text-white'
                            }`}>
                              {existingReaction.count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
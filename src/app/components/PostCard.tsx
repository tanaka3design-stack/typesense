import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent } from '@/app/components/ui/card';
import { 
  Flower2, Flower, Sparkles, Star, Heart, Zap, 
  Sun, Moon, Cloud, Coffee, Music, Palette,
  Leaf, TreePine, Umbrella, Key, Bell, Gem, MessageCircle
} from 'lucide-react';
import { PostReactions } from '@/app/components/PostReactions';

interface Post {
  id: string;
  text: string;
  name: string;
  leading: number;
  tracking: number;
  joy: number;
  surprise: number;
  anger: number;
  created_at: string;
}

interface PostCardProps {
  post: Post;
  showDetails?: boolean;
}

// ランダムにアイコンを選ぶ
const iconOptions = [
  { Icon: Flower2, color: 'text-pink-500' },
  { Icon: Flower, color: 'text-purple-500' },
  { Icon: Sparkles, color: 'text-yellow-500' },
  { Icon: Star, color: 'text-blue-500' },
  { Icon: Heart, color: 'text-red-500' },
  { Icon: Zap, color: 'text-orange-500' },
  { Icon: Sun, color: 'text-amber-500' },
  { Icon: Moon, color: 'text-indigo-500' },
  { Icon: Cloud, color: 'text-sky-500' },
  { Icon: Coffee, color: 'text-brown-500' },
  { Icon: Music, color: 'text-violet-500' },
  { Icon: Palette, color: 'text-teal-500' },
  { Icon: Leaf, color: 'text-green-500' },
  { Icon: TreePine, color: 'text-emerald-500' },
  { Icon: Umbrella, color: 'text-cyan-500' },
  { Icon: Key, color: 'text-slate-500' },
  { Icon: Bell, color: 'text-rose-500' },
  { Icon: Gem, color: 'text-fuchsia-500' },
  { Icon: MessageCircle, color: 'text-gray-500' },
];

export function PostCard({ post, showDetails = true }: PostCardProps) {
  console.log('🚨🚨🚨 POSTCARD RENDER - LATEST VERSION 🚨🚨🚨', {
    id: post.id.substring(0, 8),
    tracking: post.tracking,
    leading: post.leading
  });

  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // 投稿IDをシードとしてランダムなアイコンを選択（一貫性のため）
  const avatarIcon = useMemo(() => {
    const seed = post.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return iconOptions[seed % iconOptions.length];
  }, [post.id]);

  // 古い形式のデータを新しい形式に変換（互換性対応）
  const normalizedTracking = useMemo(() => {
    // 絶対値が1より大きい場合は古い形式（px）なので100で割る
    if (Math.abs(post.tracking) > 1) {
      console.log('🔧 Converting old format tracking:', post.tracking, '→', post.tracking / 100);
      return post.tracking / 100;
    }
    console.log('✅ Using new format tracking:', post.tracking);
    return post.tracking;
  }, [post.tracking]);

  console.log('🎨 Applying styles to post:', {
    id: post.id.substring(0, 8),
    originalTracking: post.tracking,
    normalizedTracking: normalizedTracking,
    leading: post.leading,
    finalStyle: {
      letterSpacing: `${normalizedTracking}em`,
      lineHeight: post.leading
    }
  });

  const getEmotionColor = () => {
    const positiveScore = post.joy + post.surprise;
    const negativeScore = post.anger;
    
    if (positiveScore > negativeScore + 5) return 'bg-yellow-100';
    if (negativeScore > positiveScore + 5) return 'bg-red-100';
    return 'bg-gray-100';
  };

  const formatTimestamp = (timestamp: string) => {
    const now = Date.now();
    const diff = now - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'たった今';
    if (minutes < 60) return `${minutes}分前`;
    if (hours < 24) return `${hours}時間前`;
    return `${days}日前`;
  };

  const handleLike = () => {
    if (!liked) {
      setLiked(true);
      setLikeCount(likeCount + 1);
    } else {
      setLiked(false);
      setLikeCount(likeCount - 1);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // ボタンをクリックした場合は詳細ページに遷移しない
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    // post.idをそのまま渡す（URLエンコード）
    const encodedId = encodeURIComponent(post.id);
    navigate(`/post/${encodedId}`);
  };

  const AvatarIconComponent = avatarIcon.Icon;

  return (
    <Card 
      className="transition-all border-0 bg-white shadow-[9px_9px_16px_rgba(0,0,0,0.1),-9px_-9px_16px_rgba(255,255,255,0.9)] hover:shadow-[12px_12px_20px_rgba(0,0,0,0.12),-12px_-12px_20px_rgba(255,255,255,0.9)] cursor-pointer"
      onClick={handleCardClick}
    >
      <CardContent className="pt-4 px-3 sm:pt-6 sm:px-6">
        <div className="flex gap-3">
          <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${getEmotionColor()}`}>
            <AvatarIconComponent className={`w-5 h-5 ${avatarIcon.color}`} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="font-medium text-gray-900 text-sm md:text-base">{post.name}</span>
              <span className="text-xs md:text-sm text-gray-400">
                {formatTimestamp(post.created_at)}
              </span>
            </div>
            
            <div 
              className="break-words whitespace-pre-wrap text-sm md:text-xl md:font-semibold text-gray-800"
              style={{
                letterSpacing: `${normalizedTracking}em`,  // px  em に修正
                lineHeight: post.leading,
              }}
            >
              {post.text}
            </div>
            {showDetails && (
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500 mb-3 pb-3 border-b border-gray-100">
                <span className="px-2 py-1 bg-green-50 text-green-600 rounded-full font-medium">嬉:{post.joy}</span>
                <span className="px-2 py-1 bg-yellow-50 text-yellow-600 rounded-full font-medium">驚:{post.surprise}</span>
                <span className="px-2 py-1 bg-red-50 text-red-600 rounded-full font-medium">怒:{post.anger}</span>
                <span className="mx-1 text-gray-300">|</span>
                <span className="text-xs">行:{post.leading.toFixed(2)}</span>
                <span className="text-xs">字:{post.tracking.toFixed(2)}</span>
              </div>
            )}
            <div className="flex gap-3 mt-3">
              <button 
                className={`transition-all flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
                  liked 
                    ? 'bg-red-50 text-red-500' 
                    : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                }`}
                onClick={handleLike}
              >
                <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                {likeCount > 0 && <span className="text-xs font-medium">{likeCount}</span>}
              </button>
              <PostReactions postId={post.id} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
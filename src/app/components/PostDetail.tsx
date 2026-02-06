import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, CardContent } from '@/app/components/ui/card';
import { kvStore } from '/utils/supabase/client';
import { ArrowLeft, Flower2, Flower, Sparkles, Star, Zap, Sun, Moon, Cloud, Coffee, Music, Palette, Leaf, TreePine, Umbrella, Key, Bell, Gem, MessageCircle, Heart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { PostReactions } from '@/app/components/PostReactions';

interface Post {
  id: string;
  user_id: string;
  text: string;
  name: string;
  leading: number;
  tracking: number;
  joy: number;
  surprise: number;
  anger: number;
  created_at: string;
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

export function PostDetail() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    if (!postId) return;

    setLoading(true);
    try {
      // URLデコード
      const decodedPostId = decodeURIComponent(postId);
      console.log('🔍 Fetching post with ID:', decodedPostId);
      
      // KVストアから投稿を取得（すでにpost:プレフィックスが含まれている）
      const fetchedPost = await kvStore.get(decodedPostId);
      
      console.log('📦 Fetched post:', fetchedPost);
      
      if (!fetchedPost) {
        console.log('❌ Post not found with ID:', decodedPostId);
        // 旧形式も試す（もしpost:がついていない場合）
        if (!decodedPostId.startsWith('post:') && !decodedPostId.startsWith('posts:')) {
          const withPrefix = await kvStore.get(`post:${decodedPostId}`);
          const oldFormat = await kvStore.get(`posts:${decodedPostId}`);
          setPost(withPrefix || oldFormat);
        } else {
          setPost(null);
        }
      } else {
        setPost(fetchedPost);
      }
    } catch (error) {
      console.error('投稿の取得に失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  // 投稿IDをシードとしてランダムなアイコンを選択
  const avatarIcon = useMemo(() => {
    if (!post) return iconOptions[0];
    const seed = post.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return iconOptions[seed % iconOptions.length];
  }, [post?.id]);

  // 古い形式のデータを新しい形式に変換
  const normalizedTracking = useMemo(() => {
    if (!post) return 0;
    if (Math.abs(post.tracking) > 1) {
      return post.tracking / 100;
    }
    return post.tracking;
  }, [post?.tracking]);

  const getEmotionColor = () => {
    if (!post) return 'bg-gray-100';
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

  // 文字間隔の説明を取得
  const getTrackingLabel = (tracking: number) => {
    if (tracking <= -0.05) return '狭い';
    if (tracking >= 0.1) return '広い';
    return '標準';
  };

  // 行間の説明を取得
  const getLeadingLabel = (leading: number) => {
    if (leading <= 1.6) return '狭い';
    if (leading >= 2.1) return '広い';
    return '標準';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-[4px_4px_8px_rgba(0,0,0,0.08),-4px_-4px_8px_rgba(255,255,255,0.9)] hover:shadow-[6px_6px_12px_rgba(0,0,0,0.1)] transition-all"
          >
            <ArrowLeft size={20} className="text-gray-600" />
            <span className="text-gray-700 font-medium">戻る</span>
          </button>
          <div className="text-center text-gray-400 py-12">
            <p>読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white p-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-[4px_4px_8px_rgba(0,0,0,0.08),-4px_-4px_8px_rgba(255,255,255,0.9)] hover:shadow-[6px_6px_12px_rgba(0,0,0,0.1)] transition-all"
          >
            <ArrowLeft size={20} className="text-gray-600" />
            <span className="text-gray-700 font-medium">戻る</span>
          </button>
          <div className="text-center text-gray-400 py-12">
            <p>投稿が見つかりませんでした</p>
          </div>
        </div>
      </div>
    );
  }

  const AvatarIconComponent = avatarIcon.Icon;

  // 感情データをグラフ用に変換
  const emotionData = [
    { name: '喜び', value: post.joy, color: '#10b981' },
    { name: '驚き', value: post.surprise, color: '#f59e0b' },
    { name: '怒り', value: post.anger, color: '#ef4444' },
  ];

  return (
    <div className="min-h-screen bg-white p-4 pb-32">
      <div className="max-w-4xl mx-auto">
        {/* 戻るボタン */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-[4px_4px_8px_rgba(0,0,0,0.08),-4px_-4px_8px_rgba(255,255,255,0.9)] hover:shadow-[6px_6px_12px_rgba(0,0,0,0.1)] transition-all"
        >
          <ArrowLeft size={20} className="text-gray-600" />
          <span className="text-gray-700 font-medium">戻る</span>
        </button>

        {/* メイン投稿カード */}
        <Card className="mb-6 border-0 bg-white shadow-[12px_12px_24px_rgba(0,0,0,0.12),-12px_-12px_24px_rgba(255,255,255,0.9)]">
          <CardContent className="pt-8 px-6 sm:pt-10 sm:px-10">
            <div className="flex gap-4 mb-6">
              <div className={`w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center ${getEmotionColor()}`}>
                <AvatarIconComponent className={`w-7 h-7 ${avatarIcon.color}`} />
              </div>
              
              <div className="flex-1">
                <div className="flex items-baseline gap-3 mb-3">
                  <span className="font-bold text-gray-900 text-lg">{post.name}</span>
                  <span className="text-sm text-gray-400">
                    {formatTimestamp(post.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* 投稿テキスト（大きく強調） */}
            <div 
              className="break-words whitespace-pre-wrap text-base sm:text-lg font-medium text-gray-800 mb-8 p-6 rounded-2xl bg-gray-50"
              style={{
                letterSpacing: `${normalizedTracking}em`,
                lineHeight: post.leading,
              }}
            >
              {post.text}
            </div>

            {/* アクションボタン */}
            <div className="pb-6 border-b border-gray-100">
              {/* リアクション */}
              <PostReactions postId={post.id} />
            </div>
          </CardContent>
        </Card>

        {/* 感情パラメータの詳細 */}
        <Card className="mb-6 border-0 bg-white shadow-[9px_9px_16px_rgba(0,0,0,0.1),-9px_-9px_16px_rgba(255,255,255,0.9)]">
          <CardContent className="pt-6 px-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-green-500" />
              感情パラメータ
            </h3>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 rounded-xl bg-green-50">
                <div className="text-3xl font-bold text-green-600 mb-1">{post.joy}</div>
                <div className="text-sm text-green-700 font-medium">喜び</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-yellow-50">
                <div className="text-3xl font-bold text-yellow-600 mb-1">{post.surprise}</div>
                <div className="text-sm text-yellow-700 font-medium">驚き</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-red-50">
                <div className="text-3xl font-bold text-red-600 mb-1">{post.anger}</div>
                <div className="text-sm text-red-700 font-medium">怒り</div>
              </div>
            </div>

            {/* 感情グラフ（円グラフ） */}
            <div className="flex justify-center mt-4">
              {(() => {
                // 0以外の感情のみを円グラフに含める
                const activeEmotions = [
                  { name: 'joy', value: post.joy, color: '#4ade80' },
                  { name: 'anger', value: post.anger, color: '#f87171' },
                  { name: 'surprise', value: post.surprise, color: '#facc15' }
                ].filter(e => e.value > 0);
                
                // 0以外の感情の合計
                const total = activeEmotions.reduce((sum, e) => sum + e.value, 0);
                
                // 各感情のパーセンテージ計算
                const joyPercent = post.joy > 0 ? (post.joy / total) * 100 : 0;
                const angerPercent = post.anger > 0 ? (post.anger / total) * 100 : 0;
                const surprisePercent = post.surprise > 0 ? (post.surprise / total) * 100 : 0;
                
                // SVG円グラフの円周計算
                const radius = 50;
                const circumference = 2 * Math.PI * radius;
                
                // 各セグメントのオフセット計算
                const joyDash = (joyPercent / 100) * circumference;
                const angerDash = (angerPercent / 100) * circumference;
                const surpriseDash = (surprisePercent / 100) * circumference;
                
                return (
                  <div className="relative w-40 h-40 flex-shrink-0">
                    <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                      {/* 喜び - 0より大きい場合のみ表示 */}
                      {post.joy > 0 && (
                        <circle
                          cx="60"
                          cy="60"
                          r={radius}
                          fill="none"
                          stroke="#4ade80"
                          strokeWidth="18"
                          strokeDasharray={`${joyDash} ${circumference}`}
                          strokeDashoffset="0"
                          className="transition-all duration-500"
                          strokeLinecap="round"
                        />
                      )}
                      {/* 怒り - 0より大きい場合のみ表示 */}
                      {post.anger > 0 && (
                        <circle
                          cx="60"
                          cy="60"
                          r={radius}
                          fill="none"
                          stroke="#f87171"
                          strokeWidth="18"
                          strokeDasharray={`${angerDash} ${circumference}`}
                          strokeDashoffset={`-${joyDash}`}
                          className="transition-all duration-500"
                          strokeLinecap="round"
                        />
                      )}
                      {/* 驚き - 0より大きい場合のみ表示 */}
                      {post.surprise > 0 && (
                        <circle
                          cx="60"
                          cy="60"
                          r={radius}
                          fill="none"
                          stroke="#facc15"
                          strokeWidth="18"
                          strokeDasharray={`${surpriseDash} ${circumference}`}
                          strokeDashoffset={`-${joyDash + angerDash}`}
                          className="transition-all duration-500"
                          strokeLinecap="round"
                        />
                      )}
                    </svg>
                    {/* 中央の白い円 */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 bg-white rounded-full shadow-[4px_4px_8px_rgba(0,0,0,0.08),-4px_-4px_8px_rgba(255,255,255,0.9)]"></div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </CardContent>
        </Card>

        {/* 文字組の詳細 */}
        <Card className="border-0 bg-white shadow-[9px_9px_16px_rgba(0,0,0,0.1),-9px_-9px_16px_rgba(255,255,255,0.9)]">
          <CardContent className="pt-6 px-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5 text-green-500" />
              文字組の詳細
            </h3>
            
            <div className="space-y-6">
              {/* 文字間隔 */}
              <div className="p-5 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-700">文字間隔（Letter Spacing）</span>
                  <span className="px-3 py-1 bg-white rounded-full text-sm font-bold text-blue-600 shadow-sm">
                    {getTrackingLabel(normalizedTracking)}
                  </span>
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-2">{normalizedTracking.toFixed(2)}em</div>
                <div className="text-xs text-gray-600 bg-white bg-opacity-60 rounded-lg p-2">
                  感情の強さに応じて文字の間隔が調整されています
                </div>
              </div>

              {/* 行間 */}
              <div className="p-5 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-700">行間（Line Height）</span>
                  <span className="px-3 py-1 bg-white rounded-full text-sm font-bold text-purple-600 shadow-sm">
                    {getLeadingLabel(post.leading)}
                  </span>
                </div>
                <div className="text-3xl font-bold text-purple-600 mb-2">{post.leading.toFixed(2)}</div>
                <div className="text-xs text-gray-600 bg-white bg-opacity-60 rounded-lg p-2">
                  感情の組み合わせによって行の高さが決定されています
                </div>
              </div>

              {/* 文字組の説明 */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <p className="text-sm text-gray-600 leading-relaxed">
                  このテキストは、あなたが設定した <strong className="text-green-600">喜び:{post.joy}</strong>、
                  <strong className="text-yellow-600">驚き:{post.surprise}</strong>、
                  <strong className="text-red-600">怒り:{post.anger}</strong> の感情値に基づいて、
                  自動的に文字間隔と行間調整されています。感情の強さが文字の配置に反映され、
                  視覚的な印象を変化させています。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
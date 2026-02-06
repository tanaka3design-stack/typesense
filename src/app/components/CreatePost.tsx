import { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Heart, MessageCircle, Smile, Frown, Zap } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Textarea } from '@/app/components/ui/textarea';
import { useUser } from '@/app/contexts/UserContext';
import { kvStore } from '/utils/supabase/client';
import { TypingLoader } from '@/app/components/TypingLoader';
import { toast } from 'sonner';

interface TypographyResult {
  leading: number;
  tracking: number;
  explanation: string;
}

interface CreatePostProps {
  onPostCreated?: () => void;
}

export function CreatePost({ onPostCreated }: CreatePostProps) {
  const [text, setText] = useState('');
  const [joy, setJoy] = useState(5);
  const [surprise, setSurprise] = useState(5);
  const [anger, setAnger] = useState(5);
  const [result, setResult] = useState<TypographyResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [previewLiked, setPreviewLiked] = useState(false);
  const triangleRef = useRef<SVGSVGElement>(null);
  
  const user = useUser();

  // 円グラフ用の角度計算
  const getChartData = () => {
    const data = [];
    
    // 値が1より大きい場合のみ追加
    if (joy > 1) {
      data.push({ name: '喜び', value: joy - 1, color: '#4ade80', gradient: 'joyGradient' });
    }
    if (anger > 1) {
      data.push({ name: '怒り', value: anger - 1, color: '#f87171', gradient: 'angerGradient' });
    }
    if (surprise > 0) {
      data.push({ name: '驚き', value: surprise, color: '#facc15', gradient: 'surpriseGradient' });
    }
    
    return data;
  };

  // SVG円グラフのパス生成
  const createPieSlice = (startAngle: number, endAngle: number, outerRadius: number = 80) => {
    const startRad = (startAngle - 90) * Math.PI / 180;
    const endRad = (endAngle - 90) * Math.PI / 180;
    
    const x1 = 100 + outerRadius * Math.cos(startRad);
    const y1 = 100 + outerRadius * Math.sin(startRad);
    const x2 = 100 + outerRadius * Math.cos(endRad);
    const y2 = 100 + outerRadius * Math.sin(endRad);
    
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    
    return `M 100 100 L ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  const calculateTypography = (): TypographyResult => {
    // STEP1: 主感情の決（喜び vs 怒り）
    const mainEmotion = joy >= anger ? 'joy' : 'anger';
    const strength = mainEmotion === 'joy' ? joy : anger;

    // ルール表の定義（0～9対応）
    // 喜びルール表
    const joyRules: Record<number, { line: string, letter: string }> = {
      9: { line: '狭い', letter: '狭い' },
      8: { line: '標準', letter: '狭い' },
      7: { line: '広い', letter: '狭い' },
      6: { line: '標準', letter: '標準' },
      5: { line: '狭い', letter: '標準' },
      4: { line: '広い', letter: '標準' },
      3: { line: '広い', letter: '広い' },
      2: { line: '標準', letter: '広い' },
      1: { line: '狭い', letter: '広い' },
      0: { line: '標準', letter: '標準' },
    };

    // 怒りルール表
    const angerRules: Record<number, { line: '狭い' | '標準' | '広い', letter: '狭い' | '標準' | '広い' }> = {
      9: { line: '狭い', letter: '狭い' },
      8: { line: '広い', letter: '狭い' },
      7: { line: '標準', letter: '狭い' },
      6: { line: '標準', letter: '標準' },
      5: { line: '狭い', letter: '標準' },
      4: { line: '広い', letter: '標準' },
      3: { line: '狭い', letter: '広い' },
      2: { line: '標準', letter: '広い' },
      1: { line: '広い', letter: '広い' },
      0: { line: '標準', letter: '標準' },
    };

    // STEP2: ルール表から値を取得
    const ruleTable = mainEmotion === 'joy' ? joyRules : angerRules;
    const rule = ruleTable[strength];

    // STEP3: ラベルを数値に変換（行間隔と文字間隔で別々の値）
    const lineSpacingValues: Record<string, number> = {
      '狭い': 1.5,   // 少し詰まった行間
      '標準': 1.8,   // 通常の行間
      '広い': 2.2,   // ゆったりした行間
    };

    const letterSpacingValues: Record<string, number> = {
      '狭い': -0.08,   // しっかり詰まった文字間
      '標準': 0,       // デフォルト
      '広い': 0.15,    // 広い文字間
    };

    const lineValue = lineSpacingValues[rule.line];
    const letterValue = letterSpacingValues[rule.letter];

    // STEP4: CSS値に変換
    const leading = lineValue;
    const tracking = letterValue;

    // デバッグ用のログ
    console.log('=== 文字組計算 ===');
    console.log('主感情:', mainEmotion, '強度:', strength);
    console.log('ルール:', rule);
    console.log('行間値:', lineValue, '文字間値:', letterValue);
    console.log('最終CSS:', 'leading=', leading, 'tracking=', tracking);

    // 説明文の生成
    let explanation = `主感情: ${mainEmotion === 'joy' ? '喜び' : '怒り'} (強度: ${strength})\n`;
    explanation += `ルール適用: 行間=${rule.line}、字間=${rule.letter}\n`;
    explanation += `CSS値: line-height=${leading}, letter-spacing=${tracking.toFixed(2)}em`;

    if (surprise >= 7) {
      explanation += '\n※驚きの要素が強く表現されています。';
    }

    return { leading, tracking, explanation };
  };

  const handleSubmit = async () => {
    if (text.trim()) {
      setIsCalculating(true);
      
      // ローディングアニメーションを見せるために少し遅延
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newResult = calculateTypography();
      setResult(newResult);
      setIsCalculating(false);
      toast.success('文字組計算しました！');
    }
  };

  // 感情値が変更されたら自動的に計算（テキストがある場合）
  useEffect(() => {
    if (text.trim()) {
      setIsCalculating(true);
      // 少し遅延してスムーズに見せる
      const timer = setTimeout(() => {
        const newResult = calculateTypography();
        setResult(newResult);
        setIsCalculating(false);
      }, 300);
      
      return () => clearTimeout(timer);
    } else {
      setResult(null);
    }
  }, [joy, anger, surprise, text]);

  const handlePost = async () => {
    if (!text.trim() || !result) return;

    console.log('=== 投稿開始（直接KVストア保存） ===');
    console.log('User authenticated:', user.isAuthenticated);
    console.log('User ID:', user.userId);

    // 認証チェック
    if (!user.isAuthenticated || !user.userId) {
      toast.error('投稿するにはログインが必要です');
      return;
    }

    // ✅ バリデーション：正常な範囲内かチェック
    const isValidTracking = result.tracking >= -0.08 && result.tracking <= 0.15;
    const isValidLeading = result.leading >= 1.5 && result.leading <= 2.2;

    if (!isValidTracking || !isValidLeading) {
      console.error('❌ 異常な値を検出:', { tracking: result.tracking, leading: result.leading });
      toast.error('文字組の値が異常です。再計算してください。');
      return;
    }

    try {
      // 投稿オブジェクトを作成
      const postId = `post:${Date.now()}:${user.userId}`;
      const post = {
        id: postId,
        user_id: user.userId,
        text,
        name: user?.name || '名無し',
        leading: result.leading,
        tracking: result.tracking,
        joy,
        surprise,
        anger,
        created_at: new Date().toISOString(),
      };

      console.log('💾 Saving post to KV store:', postId);
      console.log('📊 Values:', { leading: result.leading, tracking: result.tracking });

      // KVストアに直接保存
      await kvStore.set(postId, post);

      console.log('✅ 投稿成功！');
      toast.success('投稿しました！');
      
      // フォームをリセット
      setText('');
      setJoy(5);
      setSurprise(5);
      setAnger(5);
      setResult(null);

      // コールバックを呼び出す
      if (onPostCreated) {
        onPostCreated();
      }
    } catch (error: any) {
      console.error('❌ 投稿エラー:', error);
      toast.error(error.message || '投稿に失敗しました');
    }
  };

  const charCount = text.length;
  const isOverLimit = charCount > 120;

  return (
    <div className="min-h-screen bg-white p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* タイトルを削除 */}
        
        {/* デスクトップ: 2カラムレイアウト / モバイル: 縦並び */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* 左カラム: 文章入力 + プレビュー */}
          <div className="space-y-4 lg:space-y-6">
            {/* 文章入力 */}
            <div>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="今、どんな気持ち？"
                className="min-h-[120px] lg:min-h-[150px] resize-none bg-white border-2 border-gray-200 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.06),inset_-4px_-4px_8px_rgba(255,255,255,0.9)] focus:border-green-300 focus:ring-0"
                maxLength={120}
              />
              <p className={`text-xs mt-1 text-right ${isOverLimit ? 'text-red-500' : 'text-gray-500'}`}>
                {charCount} / 120
              </p>
            </div>

            {/* プレビューエリア */}
            {isCalculating ? (
              <div className="lg:flex-1">
                <TypingLoader />
              </div>
            ) : result ? (
              <div className="bg-white shadow-[inset_6px_6px_12px_rgba(0,0,0,0.06),inset_-6px_-6px_12px_rgba(255,255,255,0.9)] rounded-xl p-4 lg:flex-1">
                <div className="flex gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 mb-2">{user?.name || '名無し'}</p>
                    <p 
                      style={{
                        lineHeight: result.leading,
                        letterSpacing: `${result.tracking}em`,
                        whiteSpace: 'pre-wrap'
                      }}
                      className="text-gray-800 text-base lg:text-lg break-words"
                    >
                      {text}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 mt-3 pt-3 border-t border-gray-100">
                  <button 
                    className={`transition-all flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
                      previewLiked 
                        ? 'bg-red-50 text-red-500' 
                        : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                    }`}
                    onClick={() => setPreviewLiked(!previewLiked)}
                  >
                    <Heart className={`w-4 h-4 ${previewLiked ? 'fill-current' : ''}`} />
                  </button>
                  <button 
                    className="transition-all flex items-center gap-1.5 px-3 py-1.5 rounded-full text-gray-400 hover:text-green-500 hover:bg-green-50"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="lg:flex-1">
                <div className="text-center text-gray-400 py-12 lg:py-20">
                  <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">文章と感情を設定すると、</p>
                  <p className="text-sm">文字組のプレビューが表示されます</p>
                </div>
              </div>
            )}

            {/* 投稿ボタン（デスクトップでは左下） */}
            {result && (
              <Button 
                onClick={handlePost} 
                className="w-full bg-gradient-to-br from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white font-semibold shadow-[6px_6px_12px_rgba(0,0,0,0.1),-6px_-6px_12px_rgba(255,255,255,0.9)] border-0"
              >
                投稿する
              </Button>
            )}
          </div>

          {/* 右カラム: 感情入力 + 円グラフ */}
          <div className="space-y-6">
            {/* 感情スライダー */}
            <div className="space-y-5">
              {/* Joy Slider */}
              <div className="flex items-center gap-4">
                <Smile className="w-8 h-8 flex-shrink-0 grayscale opacity-40" />
                <div className="relative flex-1 h-16 bg-white rounded-3xl shadow-[inset_6px_6px_12px_rgba(0,0,0,0.08),inset_-6px_-6px_12px_rgba(255,255,255,0.9)] p-2">
                  <div className="relative h-full flex items-center">
                    <div 
                      className="h-full rounded-2xl bg-gradient-to-r from-green-400 to-green-300 shadow-[4px_4px_8px_rgba(0,0,0,0.1),-2px_-2px_6px_rgba(255,255,255,0.7)] transition-all duration-300 flex items-center justify-end pr-1"
                      style={{ width: `${(joy / 9) * 100}%` }}
                    >
                      <div className="w-10 h-10 bg-white rounded-full shadow-[6px_6px_12px_rgba(0,0,0,0.15),-4px_-4px_10px_rgba(255,255,255,0.9)] border-2 border-green-300"></div>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="9"
                    step="1"
                    value={joy}
                    onChange={(e) => setJoy(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <span className="text-sm font-bold text-green-600 bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-[4px_4px_8px_rgba(0,0,0,0.08),-4px_-4px_8px_rgba(255,255,255,0.9)] flex-shrink-0">
                  {joy}
                </span>
              </div>

              {/* Surprise Slider */}
              <div className="flex items-center gap-4">
                {/* 驚き顔アイコン（目を見開いてる） */}
                <svg className="w-8 h-8 flex-shrink-0 grayscale opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="8" cy="10" r="1.5" fill="currentColor" />
                  <circle cx="16" cy="10" r="1.5" fill="currentColor" />
                  <circle cx="12" cy="15" r="2" />
                </svg>
                <div className="relative flex-1 h-16 bg-white rounded-3xl shadow-[inset_6px_6px_12px_rgba(0,0,0,0.08),inset_-6px_-6px_12px_rgba(255,255,255,0.9)] p-2">
                  <div className="relative h-full flex items-center">
                    <div 
                      className="h-full rounded-2xl bg-gradient-to-r from-yellow-400 to-yellow-300 shadow-[4px_4px_8px_rgba(0,0,0,0.1),-2px_-2px_6px_rgba(255,255,255,0.7)] transition-all duration-300 flex items-center justify-end pr-1"
                      style={{ width: `${(surprise / 9) * 100}%` }}
                    >
                      <div className="w-10 h-10 bg-white rounded-full shadow-[6px_6px_12px_rgba(0,0,0,0.15),-4px_-4px_10px_rgba(255,255,255,0.9)] border-2 border-yellow-300"></div>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="9"
                    step="1"
                    value={surprise}
                    onChange={(e) => setSurprise(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <span className="text-sm font-bold text-yellow-600 bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-[4px_4px_8px_rgba(0,0,0,0.08),-4px_-4px_8px_rgba(255,255,255,0.9)] flex-shrink-0">
                  {surprise}
                </span>
              </div>

              {/* Anger Slider */}
              <div className="flex items-center gap-4">
                <Frown className="w-8 h-8 flex-shrink-0 grayscale opacity-40" />
                <div className="relative flex-1 h-16 bg-white rounded-3xl shadow-[inset_6px_6px_12px_rgba(0,0,0,0.08),inset_-6px_-6px_12px_rgba(255,255,255,0.9)] p-2">
                  <div className="relative h-full flex items-center">
                    <div 
                      className="h-full rounded-2xl bg-gradient-to-r from-red-400 to-red-300 shadow-[4px_4px_8px_rgba(0,0,0,0.1),-2px_-2px_6px_rgba(255,255,255,0.7)] transition-all duration-300 flex items-center justify-end pr-1"
                      style={{ width: `${(anger / 9) * 100}%` }}
                    >
                      <div className="w-10 h-10 bg-white rounded-full shadow-[6px_6px_12px_rgba(0,0,0,0.15),-4px_-4px_10px_rgba(255,255,255,0.9)] border-2 border-red-300"></div>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="9"
                    step="1"
                    value={anger}
                    onChange={(e) => setAnger(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <span className="text-sm font-bold text-red-600 bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-[4px_4px_8px_rgba(0,0,0,0.08),-4px_-4px_8px_rgba(255,255,255,0.9)] flex-shrink-0">
                  {anger}
                </span>
              </div>
            </div>

            {/* 感情サマリー表示（円グラフ） */}
            <div className="bg-white rounded-3xl shadow-[inset_6px_6px_12px_rgba(0,0,0,0.08),inset_-6px_-6px_12px_rgba(255,255,255,0.9)] p-6">
              {(() => {
                // 最大の感情を見つける
                const emotions = [
                  { name: '喜び', value: joy, color: '#4ade80', icon: Smile },
                  { name: '怒り', value: anger, color: '#f87171', icon: Frown },
                  { name: '驚き', value: surprise, color: '#facc15', icon: Zap }
                ];
                
                const maxEmotion = emotions.reduce((max, e) => e.value > max.value ? e : max, emotions[0]);
                
                // 0以外の感情のみを円グラフに含める
                const activeEmotions = [
                  { name: 'joy', value: joy, color: '#4ade80' },
                  { name: 'anger', value: anger, color: '#f87171' },
                  { name: 'surprise', value: surprise, color: '#facc15' }
                ].filter(e => e.value > 0);
                
                // 0以外の感情の合計
                const total = activeEmotions.reduce((sum, e) => sum + e.value, 0);
                
                // 各感情のパーセンテージ計算
                const joyPercent = joy > 0 ? (joy / total) * 100 : 0;
                const angerPercent = anger > 0 ? (anger / total) * 100 : 0;
                const surprisePercent = surprise > 0 ? (surprise / total) * 100 : 0;
                
                // SVG円グラフの円周計算
                const radius = 50;
                const circumference = 2 * Math.PI * radius;
                
                // 各セグメントのオフセット計算
                const joyDash = (joyPercent / 100) * circumference;
                const angerDash = (angerPercent / 100) * circumference;
                const surpriseDash = (surprisePercent / 100) * circumference;
                
                return (
                  <div className="flex items-center gap-5">
                    {/* 左側: 円グラフ */}
                    <div className="relative w-28 h-28 flex-shrink-0">
                      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                        {/* 喜び - 0より大きい場合のみ表示 */}
                        {joy > 0 && (
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
                        {/* 怒り - 0より大い合の表示 */}
                        {anger > 0 && (
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
                        {surprise > 0 && (
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
                        <div className="w-16 h-16 bg-white rounded-full shadow-[4px_4px_8px_rgba(0,0,0,0.08),-4px_-4px_8px_rgba(255,255,255,0.9)]"></div>
                      </div>
                    </div>
                    
                    {/* 右側: 詳細情報 */}
                    <div className="flex-1 space-y-3">
                      <div>
                        <div className="text-xs font-medium text-gray-400 mb-1.5">
                          主な感情
                        </div>
                        <div className="text-xl font-bold mb-3" style={{ color: maxEmotion.color }}>
                          {maxEmotion.name}
                        </div>
                      </div>
                      
                      {result && (
                        <div className="space-y-2.5 text-sm">
                          <div className="flex items-center justify-between bg-white rounded-2xl px-4 py-3 shadow-[inset_3px_3px_6px_rgba(0,0,0,0.06),inset_-3px_-3px_6px_rgba(255,255,255,0.9)]">
                            <span className="text-gray-500 text-xs font-medium">行間隔</span>
                            <span className="font-bold text-gray-700">{result.leading.toFixed(1)}</span>
                          </div>
                          <div className="flex items-center justify-between bg-white rounded-2xl px-4 py-3 shadow-[inset_3px_3px_6px_rgba(0,0,0,0.06),inset_-3px_-3px_6px_rgba(255,255,255,0.9)]">
                            <span className="text-gray-500 text-xs font-medium">文字間隔</span>
                            <span className="font-bold text-gray-700">{result.tracking.toFixed(2)}em</span>
                          </div>
                        </div>
                      )}
                      
                      {!result && (
                        <p className="text-xs text-gray-400 italic mt-2">
                          文字組を計算すると詳細が表示されます
                        </p>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
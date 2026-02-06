import { useState, useEffect } from 'react';
import { PostCard } from '@/app/components/PostCard';
import { useUser } from '@/app/contexts/UserContext';
import { kvStore } from '/utils/supabase/client';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';

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

type TabType = 'all' | 'mine';

export function Timeline() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabType>('all');
  const user = useUser();

  useEffect(() => {
    fetchPosts();
  }, [tab]);

  const fetchPosts = async () => {
    setLoading(true);
    
    console.log('🚨🚨🚨 TIMELINE FETCH - LATEST VERSION 🚨🚨🚨');
    
    try {
      console.log('🔵 START: Fetching posts from tab:', tab);
      
      // KVストアから直接投稿を取得
      const newPosts = await kvStore.getByPrefix('post:');
      const oldPosts = await kvStore.getByPrefix('posts:'); // 後方互換性のため
      
      console.log('🔵 RAW DATA:', {
        newPostsCount: newPosts.length,
        oldPostsCount: oldPosts.length,
        newPostsSample: newPosts[0],
        oldPostsSample: oldPosts[0]
      });
      
      let allPosts = [...newPosts, ...oldPosts];
      
      console.log(`✅ Found ${newPosts.length} new posts and ${oldPosts.length} old posts`);

      // 「自分の投稿」タブの場合はフィルタリング
      if (tab === 'mine') {
        if (!user.isAuthenticated || !user.userId) {
          console.log('Not authenticated, showing empty posts');
          setPosts([]);
          setLoading(false);
          return;
        }
        
        allPosts = allPosts.filter((post: any) => post.user_id === user.userId);
        console.log(`✅ Filtered to ${allPosts.length} posts for user ${user.userId}`);
      }

      // 作成日時の降順でソート
      const sortedPosts = allPosts.sort((a: any, b: any) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      console.log('🔵 FINAL POSTS TO DISPLAY:', sortedPosts.length, sortedPosts);
      setPosts(sortedPosts);
    } catch (error: any) {
      console.error('投稿取得エラー:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 pb-32">
      <div className="max-w-6xl mx-auto">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('all')}
            className={`flex-1 py-3 rounded-2xl font-medium transition-all ${
              tab === 'all'
                ? 'bg-gradient-to-br from-green-400 to-green-500 text-white shadow-[4px_4px_8px_rgba(0,0,0,0.1),-4px_-4px_8px_rgba(255,255,255,0.9)]'
                : 'bg-white text-gray-500 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.06),inset_-4px_-4px_8px_rgba(255,255,255,0.9)]'
            }`}
          >
            すべて
          </button>
          <button
            onClick={() => setTab('mine')}
            className={`flex-1 py-3 rounded-2xl font-medium transition-all ${
              tab === 'mine'
                ? 'bg-gradient-to-br from-green-400 to-green-500 text-white shadow-[4px_4px_8px_rgba(0,0,0,0.1),-4px_-4px_8px_rgba(255,255,255,0.9)]'
                : 'bg-white text-gray-500 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.06),inset_-4px_-4px_8px_rgba(255,255,255,0.9)]'
            }`}
          >
            自分の投稿
          </button>
        </div>

        {loading ? (
          <div className="shadow-[9px_9px_16px_rgba(0,0,0,0.1),-9px_-9px_16px_rgba(255,255,255,0.9)] rounded-2xl border-0 bg-white p-6">
            <div className="text-center text-gray-400 py-12">
              <p>読み込み中...</p>
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div className="shadow-[9px_9px_16px_rgba(0,0,0,0.1),-9px_-9px_16px_rgba(255,255,255,0.9)] rounded-2xl border-0 bg-white p-6">
            <div className="text-center text-gray-400 py-12">
              <p>まだ投稿がありません</p>
              <p className="text-sm mt-2">右下のボタンから投稿してみましょう</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {posts.map((post) => {
              console.log('📊 Post full data:', {
                id: post.id.substring(0, 8),
                text: post.text.substring(0, 20),
                tracking: post.tracking,
                leading: post.leading,
                joy: post.joy,
                surprise: post.surprise,
                anger: post.anger
              });
              return <PostCard key={post.id} post={post} showDetails={tab === 'mine'} />;
            })}
          </div>
        )}
      </div>
    </div>
  );
}
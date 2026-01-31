import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

// 環境変数を優先、なければinfo.tsxの値を使用
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || `https://${projectId}.supabase.co`;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || publicAnonKey;

// Supabase クライアントの初期化
export const supabase = createClient(supabaseUrl, supabaseKey);

// KVストア操作関数
export const kvStore = {
  // 単一の値を取得
  async get(key: string) {
    const { data, error } = await supabase
      .from('kv_store_409e62bf')
      .select('value')
      .eq('key', key)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // レコードが見つからない場合はnullを返す
        return null;
      }
      throw error;
    }

    return data?.value || null;
  },

  // 単一の値を設定
  async set(key: string, value: any) {
    const { error } = await supabase
      .from('kv_store_409e62bf')
      .upsert({ key, value }, { onConflict: 'key' });

    if (error) throw error;
  },

  // 単一の値を削除
  async del(key: string) {
    const { error } = await supabase
      .from('kv_store_409e62bf')
      .delete()
      .eq('key', key);

    if (error) throw error;
  },

  // プレフィックスで複数の値を取得
  async getByPrefix(prefix: string) {
    const { data, error } = await supabase
      .from('kv_store_409e62bf')
      .select('key, value')
      .like('key', `${prefix}%`)
      .order('key', { ascending: false });

    if (error) throw error;

    return data?.map(row => row.value) || [];
  },

  // 複数の値を取得
  async mget(keys: string[]) {
    const { data, error } = await supabase
      .from('kv_store_409e62bf')
      .select('key, value')
      .in('key', keys);

    if (error) throw error;

    return data?.map(row => row.value) || [];
  },

  // 複数の値を設定
  async mset(entries: Record<string, any>) {
    const rows = Object.entries(entries).map(([key, value]) => ({ key, value }));
    
    const { error } = await supabase
      .from('kv_store_409e62bf')
      .upsert(rows, { onConflict: 'key' });

    if (error) throw error;
  },

  // 複数の値を削除
  async mdel(keys: string[]) {
    const { error } = await supabase
      .from('kv_store_409e62bf')
      .delete()
      .in('key', keys);

    if (error) throw error;
  }
};
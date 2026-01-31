import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';

// Supabaseクライアントのシングルトンインスタンス
export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

// KVストアヘルパー関数
export const kvStore = {
  // 単一の値を取得
  async get(key: string) {
    const { data, error } = await supabase
      .from('kv_store_409e62bf')
      .select('value')
      .eq('key', key)
      .single();
    
    if (error) {
      console.error('KV get error:', error);
      return null;
    }
    
    return data?.value;
  },

  // 値を設定
  async set(key: string, value: any) {
    const { error } = await supabase
      .from('kv_store_409e62bf')
      .upsert({ key, value }, { onConflict: 'key' });
    
    if (error) {
      console.error('KV set error:', error);
      throw error;
    }
  },

  // プレフィックスで検索
  async getByPrefix(prefix: string) {
    const { data, error } = await supabase
      .from('kv_store_409e62bf')
      .select('value')
      .like('key', `${prefix}%`);
    
    if (error) {
      console.error('KV getByPrefix error:', error);
      return [];
    }
    
    return data?.map(row => row.value) || [];
  },

  // キーを削除
  async delete(key: string) {
    const { error } = await supabase
      .from('kv_store_409e62bf')
      .delete()
      .eq('key', key);
    
    if (error) {
      console.error('KV delete error:', error);
      throw error;
    }
  }
};

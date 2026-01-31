import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';

// Supabaseクライアントの作成
const supabaseUrl = `https://${projectId}.supabase.co`;
const supabaseAnonKey = publicAnonKey;

// Supabaseが設定されているかチェック
export const isSupabaseConfigured = supabaseUrl.startsWith('http') && supabaseAnonKey.length > 20;

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
      },
    })
  : null;

export interface Post {
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
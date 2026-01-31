# Supabaseセットアップガイド

このアプリはSupabaseを使用してユーザー認証と投稿データの保存を行います。

## 手順1: Supabaseプロジェクトを作成

1. [Supabase](https://supabase.com)にアクセス
2. 「New Project」をクリック
3. プロジェクト情報を入力：
   - **Name**: `typesense`（任意）
   - **Database Password**: 安全なパスワードを設定
   - **Region**: `Northeast Asia (Tokyo)` を推奨
4. 「Create new project」をクリック（数分かかります）

## 手順2: プロジェクト情報の取得

1. 左サイドバーの⚙️**Settings** → **API**をクリック
2. 以下の情報をメモ：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...`の長い文字列

## 手順3: データベーステーブルを作成

Supabaseダッシュボードで「SQL Editor」を開き、以下のSQLを実行してください：

```sql
-- KVストアテーブルの作成
CREATE TABLE kv_store_409e62bf (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックスの作成
CREATE INDEX idx_kv_store_key ON kv_store_409e62bf(key);

-- Row Level Security (RLS)の有効化
ALTER TABLE kv_store_409e62bf ENABLE ROW LEVEL SECURITY;

-- 認証済みユーザーは全操作可能
CREATE POLICY "Enable all for authenticated users" ON kv_store_409e62bf
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 匿名ユーザーも読み書き可能（開発用）
CREATE POLICY "Enable all for anon" ON kv_store_409e62bf
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);
```

## 手順4: メール認証の設定

開発環境では、メール確認を無効化します：

1. 左サイドバーの **Authentication** → **Providers**をクリック
2. **Email**をクリック
3. **Confirm email**のチェックを**外す**
4. **Save**をクリック

⚠️ **本番環境では、必ずメール確認を有効化してください！**

## 手順5: 環境変数を設定

### ローカル開発の場合

`/utils/supabase/info.tsx` を編集：

```typescript
export const projectId = "YOUR_PROJECT_ID"  // xxxxx部分のみ
export const publicAnonKey = "YOUR_ANON_KEY"
```

### Vercelデプロイの場合

Vercelダッシュボードで以下の環境変数を設定：

- `VITE_SUPABASE_URL`: `https://YOUR_PROJECT_ID.supabase.co`
- `VITE_SUPABASE_ANON_KEY`: `YOUR_ANON_KEY`

## 手順6: アプリを起動

環境変数を設定したら、アプリが自動的にSupabaseに接続されます！

```bash
npm install
npm run dev
```

---

## 機能

- ✅ ユーザー認証（メールアドレス・パスワード）
- ✅ 投稿の永続化（クラウド保存）
- ✅ ユーザープロフィール管理
- ✅ 感情データの保存
- ✅ タイムライン表示

## データ構造

KVストアに保存されるデータ：

### ユーザープロフィール
```json
{
  "key": "user:{userId}",
  "value": {
    "id": "user-id",
    "name": "山田太郎",
    "email": "example@email.com",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### 投稿データ
```json
{
  "key": "post:{timestamp}:{userId}",
  "value": {
    "id": "post:1234567890:user-id",
    "user_id": "user-id",
    "name": "山田太郎",
    "text": "今日はいい天気！",
    "leading": 1.5,
    "tracking": 0.05,
    "joy": 7,
    "surprise": 3,
    "anger": 2,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

## 注意事項

- このアプリはユーザー認証機能を実装していますが、開発段階ではメール確認を無効化しています
- 本番環境では必ずメール確認を有効化し、適切なセキュリティ設定を追加してください
- RLSポリシーは開発用の設定です。本番環境では適切に調整してください
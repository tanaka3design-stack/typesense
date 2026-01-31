# TypeSense デプロイガイド 🚀

このガイドでは、TypeSenseアプリをVercelに無料でデプロイする手順を説明します。

## 📋 事前準備

以下のアカウントを作成してください（すべて無料）：

1. **GitHubアカウント**: https://github.com/signup
2. **Supabaseアカウント**: https://supabase.com/dashboard/sign-up
3. **Vercelアカウント**: https://vercel.com/signup

## 🗄️ Step 1: Supabaseのセットアップ

### 1.1 Supabaseプロジェクトの作成

1. https://supabase.com/dashboard にアクセス
2. "New Project"をクリック
3. プロジェクト情報を入力：
   - **Name**: `typesense`（任意）
   - **Database Password**: 安全なパスワードを設定
   - **Region**: `Northeast Asia (Tokyo)` を推奨
4. "Create new project"をクリック（数分かかります）

### 1.2 プロジェクト情報の取得

プロジェクトが作成されたら：

1. 左サイドバーの⚙️**Settings** → **API**をクリック
2. 以下の情報をメモ：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...`の長い文字列

### 1.3 データベーステーブルの作成

1. 左サイドバーの **SQL Editor**をクリック
2. 以下のSQLをコピー＆ペーストして実行：

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

-- 匿名ユーザーは読み書き可能（開発用）
CREATE POLICY "Enable all for anon" ON kv_store_409e62bf
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);
```

3. **RUN**ボタンをクリック
4. "Success. No rows returned" と表示されればOK！

### 1.4 メール認証の設定

開発環境では、メール確認を無効化します：

1. 左サイドバーの **Authentication** → **Providers**をクリック
2. **Email**をクリック
3. **Confirm email**のチェックを**外す**
4. **Save**をクリック

⚠️ **本番環境では、必ずメール確認を有効化してください！**

## 📦 Step 2: GitHubリポジトリの作成

### 2.1 コードをダウンロード

1. Figma Makeでプロジェクトを開く
2. コードをすべてダウンロード（zipファイル）
3. zipファイルを解凍

### 2.2 GitHubリポジトリの作成

1. https://github.com/new にアクセス
2. リポジトリ情報を入力：
   - **Repository name**: `typesense`
   - **Description**: `感情で文字組が変わる投稿アプリ`
   - **Public** または **Private** を選択
3. "Create repository"をクリック

### 2.3 コードをプッシュ

解凍したフォルダをターミナル（またはコマンドプロンプト）で開き、以下のコマンドを実行：

```bash
# Gitの初期化
git init

# すべてのファイルを追加
git add .

# 最初のコミット
git commit -m "Initial commit: TypeSense app"

# メインブランチに変更
git branch -M main

# GitHubリポジトリと連携（URLは自分のものに変更）
git remote add origin https://github.com/YOUR_USERNAME/typesense.git

# プッシュ
git push -u origin main
```

✅ GitHubのリポジトリページを開いて、コードがアップロードされていることを確認！

## 🌐 Step 3: Vercelにデプロイ

### 3.1 Vercelにログイン

1. https://vercel.com にアクセス
2. **Continue with GitHub**をクリック
3. GitHubアカウントと連携

### 3.2 プロジェクトのインポート

1. ダッシュボードで **Add New...** → **Project**をクリック
2. GitHubリポジトリの一覧から **typesense**を探す
3. **Import**をクリック

### 3.3 プロジェクト設定

**Configure Project**画面で以下を設定：

#### Framework Preset
- 自動的に **Vite** が選択されます

#### Root Directory
- デフォルトの `./` のままでOK

#### Build and Output Settings
- **Build Command**: `npm run build`（デフォルト）
- **Output Directory**: `dist`（デフォルト）

#### Environment Variables（重要！）

**Add**ボタンをクリックして、以下の2つを追加：

1. **Name**: `VITE_SUPABASE_URL`
   - **Value**: `https://xxxxx.supabase.co`（Step 1.2でメモしたURL）

2. **Name**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: `eyJhbGc...`（Step 1.2でメモしたanon key）

### 3.4 デプロイ実行

1. すべて設定したら **Deploy**ボタンをクリック
2. ビルドが始まります（1〜2分かかります）
3. "Congratulations!"と表示されたら成功！🎉

### 3.5 URLを確認

デプロイが完了すると、URLが発行されます：

```
https://typesense-xxxxx.vercel.app
```

このURLを開いて、アプリが動作することを確認しましょう！

## ✅ Step 4: 動作確認

1. デプロイされたURLにアクセス
2. **新規登録**をクリック
3. 名前、メールアドレス、パスワードを入力してアカウント作成
4. ログイン後、投稿を作成してみる
5. タイムラインで投稿が表示されることを確認

## 🎨 カスタムドメインの設定（オプション）

独自ドメインを使いたい場合：

1. Vercelダッシュボードで **Settings** → **Domains**をクリック
2. ドメインを入力（例：`typesense.com`）
3. DNS設定の手順に従う

無料で使える `.vercel.app` ドメインでも十分機能します！

## 🔄 アップデート方法

コードを変更した場合の更新方法：

```bash
# 変更をコミット
git add .
git commit -m "Update: 変更内容"

# GitHubにプッシュ
git push
```

GitHubにプッシュすると、**自動的にVercelが再デプロイ**します！

## 🐛 トラブルシューティング

### ビルドエラーが出る場合

1. `package.json` に必要なパッケージがすべて含まれているか確認
2. `vite.config.ts` が正しく設定されているか確認

### ログインできない場合

1. Supabaseの環境変数が正しく設定されているか確認
2. Supabaseの**Authentication**が有効になっているか確認
3. ブラウザのコンソールでエラーを確認

### 投稿が保存されない場合

1. Supabaseの`kv_store_409e62bf`テーブルが作成されているか確認
2. RLSポリシーが正しく設定されているか確認

### エラーログの確認方法

Vercelダッシュボード → プロジェクト → **Deployments** → 最新のデプロイ → **View Function Logs**

## 📞 サポート

問題が解決しない場合：

- Vercel: https://vercel.com/support
- Supabase: https://supabase.com/docs
- GitHub Issues: プロジェクトのIssuesページ

---

## 🎉 デプロイ完了！

おめでとうございます！TypeSenseアプリが世界中からアクセスできるようになりました！

URLを友達にシェアして、感情で文字組が変わる投稿を楽しんでください！💚

**デプロイURL**: `https://typesense-xxxxx.vercel.app`（あなた専用のURL）

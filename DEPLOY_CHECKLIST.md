# TypeSense デプロイチェックリスト ✅

このチェックリストに従って、TypeSenseアプリを15分でデプロイしましょう！

## 📝 準備編（5分）

### アカウント作成
- [ ] GitHubアカウント作成: https://github.com/signup
- [ ] Supabaseアカウント作成: https://supabase.com/dashboard/sign-up
- [ ] Vercelアカウント作成: https://vercel.com/signup

## 🗄️ Supabase設定編（5分）

### プロジェクト作成
- [ ] Supabaseで新しいプロジェクトを作成
- [ ] Project URLをメモ（`https://xxxxx.supabase.co`）
- [ ] anon keyをメモ（`eyJhbGc...`で始まる長い文字列）

### データベース設定
- [ ] SQL Editorを開く
- [ ] 以下のSQLを実行：

```sql
CREATE TABLE kv_store_409e62bf (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_kv_store_key ON kv_store_409e62bf(key);

ALTER TABLE kv_store_409e62bf ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for authenticated users" ON kv_store_409e62bf
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for anon" ON kv_store_409e62bf
  FOR ALL TO anon USING (true) WITH CHECK (true);
```

- [ ] "Success"メッセージを確認

### 認証設定
- [ ] Authentication → Providers → Email を開く
- [ ] "Confirm email"のチェックを**外す**
- [ ] Saveをクリック

## 📦 GitHub設定編（3分）

### リポジトリ作成
- [ ] https://github.com/new で新規リポジトリ作成
- [ ] リポジトリ名: `typesense`
- [ ] Public または Private を選択

### コードアップロード

ターミナルで以下を実行：

```bash
git init
git add .
git commit -m "Initial commit: TypeSense app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/typesense.git
git push -u origin main
```

- [ ] GitHubでコードがアップロードされたことを確認

## 🚀 Vercel設定編（2分）

### プロジェクトインポート
- [ ] https://vercel.com にアクセス
- [ ] "Continue with GitHub"でログイン
- [ ] "Add New..." → "Project"をクリック
- [ ] `typesense`リポジトリをImport

### 環境変数設定
- [ ] `VITE_SUPABASE_URL` を追加（SupabaseのProject URL）
- [ ] `VITE_SUPABASE_ANON_KEY` を追加（Supabaseのanon key）

### デプロイ実行
- [ ] "Deploy"ボタンをクリック
- [ ] ビルド完了を待つ（1〜2分）
- [ ] "Congratulations!"メッセージを確認

## ✅ 動作確認編（1分）

### アプリテスト
- [ ] デプロイされたURLを開く（`https://typesense-xxxxx.vercel.app`）
- [ ] 新規登録画面が表示されることを確認
- [ ] テストアカウントを作成（名前・メール・パスワード）
- [ ] ログインできることを確認
- [ ] 投稿を作成して保存できることを確認
- [ ] タイムラインに投稿が表示されることを確認

## 🎉 完了！

すべてのチェックが完了したら、アプリは公開状態です！

### 次のステップ
- [ ] URLを友達にシェア
- [ ] カスタムドメインを設定（オプション）
- [ ] ソーシャルログイン追加（オプション）

---

## 🐛 トラブルシューティング

### ビルドエラー
→ `package.json`と`vite.config.ts`を確認

### ログインできない
→ Supabaseの環境変数とAuthentication設定を確認

### 投稿が保存されない
→ Supabaseのテーブルとポリシーを確認

### 詳細は `DEPLOY_GUIDE.md` を参照！

---

**デプロイ完了時刻**: ___:___

**デプロイURL**: https://________________________.vercel.app

**メモ**: 

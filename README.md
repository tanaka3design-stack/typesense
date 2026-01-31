# TypeSense

**感情で文字組が変わる投稿アプリ**

TypeSenseは、ユーザーの感情入力に基づいて文字組（行間・字間）が自動調整される革新的なSNSアプリです。

## 🌟 主な機能

- **感情入力スライダー**: 喜び・怒り・驚きの3つの感情を0〜9で調整
- **リアルタイム文字組計算**: 感情値に応じて行間隔・文字間隔が自動提案
- **ビジュアル化**: 円グラフで感情の割合を表示
- **投稿機能**: 感情データと共にSupabaseに保存
- **タイムライン**: 全ユーザーの投稿を閲覧
- **ユーザー認証**: メールアドレス＆パスワードでログイン
- **ニューモーフィズムデザイン**: 白ベースの洗練されたUI
- **レスポンシブ対応**: デスクトップ・モバイル両対応

## 🚀 デプロイ手順

### 1. リポジトリのクローン

```bash
git clone <your-repo-url>
cd typesense
```

### 2. 依存関係のインストール

```bash
npm install
# または
pnpm install
```

### 3. Supabaseのセットアップ

#### 3.1 Supabaseプロジェクトの作成
1. [Supabase](https://supabase.com)にアクセス
2. 新しいプロジェクトを作成
3. プロジェクトURLとANON KEYをコピー

#### 3.2 データベーステーブルの作成
Supabaseダッシュボードで以下のSQLを実行：

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

-- ポリシーの作成（認証済みユーザーは全操作可能）
CREATE POLICY "Enable all access for authenticated users" ON kv_store_409e62bf
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 匿名ユーザーも読み取り可能
CREATE POLICY "Enable read access for anon users" ON kv_store_409e62bf
  FOR SELECT
  TO anon
  USING (true);
```

#### 3.3 メール認証の設定
1. Supabaseダッシュボード → Authentication → Providers
2. Email providerを有効化
3. "Confirm email"を**無効化**（開発用。本番環境では有効化推奨）

### 4. 環境変数の設定

#### ローカル開発の場合
`/utils/supabase/info.tsx` を編集：

```typescript
export const projectId = "YOUR_PROJECT_ID"
export const publicAnonKey = "YOUR_ANON_KEY"
```

#### Vercelデプロイの場合
Vercelダッシュボードで以下の環境変数を設定：

- `VITE_SUPABASE_URL`: `https://YOUR_PROJECT_ID.supabase.co`
- `VITE_SUPABASE_ANON_KEY`: `YOUR_ANON_KEY`

※ 環境変数を使用する場合は、コードを以下のように修正：

```typescript
// /utils/supabase/client.tsx
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || `https://${projectId}.supabase.co`;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || publicAnonKey;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

### 5. ローカルで実行

```bash
npm run dev
```

http://localhost:5173 にアクセス

### 6. Vercelにデプロイ

#### 方法1: GitHub連携（推奨）

1. **GitHubリポジトリを作成**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Vercelにログイン**
   - https://vercel.com にアクセス
   - GitHubアカウントで連携

3. **新しいプロジェクトをインポート**
   - "New Project" → GitHubリポジトリを選択
   - Framework Preset: **Vite**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **環境変数を追加**
   - Settings → Environment Variables
   - `VITE_SUPABASE_URL` と `VITE_SUPABASE_ANON_KEY` を追加

5. **デプロイ**
   - "Deploy" ボタンをクリック
   - 数分で完成！🎉

#### 方法2: Vercel CLIを使用

```bash
# Vercel CLIのインストール
npm i -g vercel

# ログイン
vercel login

# デプロイ
vercel

# 本番環境にデプロイ
vercel --prod
```

## 📁 プロジェクト構造

```
typesense/
├── src/
│   ├── app/
│   │   ├── App.tsx                 # メインコンポーネント
│   │   ├── components/
│   │   │   ├── Auth.tsx            # 認証画面
│   │   │   ├── CreatePost.tsx      # 投稿作成画面
│   │   │   ├── Timeline.tsx        # タイムライン
│   │   │   ├── PostCard.tsx        # 投稿カード
│   │   │   └── ui/                 # UIコンポーネント
│   │   └── contexts/
│   │       └── UserContext.tsx     # ユーザーコンテキスト
│   ├── styles/
│   │   ├── index.css
│   │   ├── fonts.css
│   │   └── theme.css
│   └── utils/
│       └── supabase/
│           └── client.tsx           # Supabaseクライアント
├── public/
├── package.json
├── vite.config.ts
└── vercel.json
```

## 🎨 技術スタック

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS v4 + Radix UI
- **Backend**: Supabase (Auth + Database)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Hosting**: Vercel

## 🔧 開発

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# プレビュー
npm run preview
```

## 📝 ライセンス

MIT

## 👨‍💻 作者

Figma Makeで作成

---

**TypeSense** - 感情が見える、文字組が変わる 💚

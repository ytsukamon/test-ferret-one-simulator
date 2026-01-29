# Vercelデプロイ手順ガイド

## 前提条件

- Node.js 18以上がインストールされていること
- Vercelアカウント（無料で作成可能: https://vercel.com/signup）

## デプロイ方法（推奨：GitHub連携）

### ステップ1: GitHubリポジトリの作成

1. GitHubにログイン
2. 新しいリポジトリを作成（例: `ferret-one-simulator`）
3. ローカルでGitを初期化してプッシュ

```bash
cd ferret-one-simulator
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ferret-one-simulator.git
git push -u origin main
```

### ステップ2: Vercelとの連携

1. [Vercel](https://vercel.com)にログイン
2. "Add New..." > "Project"をクリック
3. "Import Git Repository"セクションでGitHubリポジトリを検索
4. `ferret-one-simulator`を選択
5. 設定はデフォルトのままで"Deploy"をクリック

### ステップ3: デプロイ完了

- 数分でデプロイが完了します
- Vercelが自動的にURLを生成します（例: `https://ferret-one-simulator.vercel.app`）
- 以降、mainブランチへのプッシュで自動デプロイされます

## 代替方法1: Vercel CLI

### インストール

```bash
npm i -g vercel
```

### デプロイ

```bash
cd ferret-one-simulator
vercel login  # 初回のみ
vercel        # デプロイ
```

プロンプトに従って設定を進めてください。

### 本番環境へのデプロイ

```bash
vercel --prod
```

## 代替方法2: 手動アップロード

1. プロジェクトをビルド
```bash
npm install
npm run build
```

2. [Vercel Dashboard](https://vercel.com/dashboard)にアクセス
3. "Add New..." > "Project"をクリック
4. "Continue with Other"を選択
5. プロジェクトフォルダをドラッグ&ドロップまたは選択
6. "Deploy"をクリック

## 環境変数の設定（必要に応じて）

Vercel Dashboard > プロジェクト > Settings > Environment Variables

現在のアプリケーションでは環境変数は不要ですが、将来的にAPIキーなどを使用する場合はここで設定します。

## カスタムドメインの設定

1. Vercel Dashboard > プロジェクト > Settings > Domains
2. カスタムドメインを入力
3. DNSレコードを設定（Vercelが指示を表示）

## トラブルシューティング

### ビルドエラーが発生する場合

ローカルで以下を実行してエラーを確認：
```bash
npm run build
```

### デプロイ後にページが表示されない

1. Vercel Dashboard > Deployments から最新のデプロイログを確認
2. Build Logsでエラーメッセージを確認

## 更新方法

### GitHub連携の場合

```bash
git add .
git commit -m "Update features"
git push
```

プッシュすると自動的にVercelが再デプロイします。

### Vercel CLIの場合

```bash
vercel --prod
```

## パフォーマンス最適化

このプロジェクトは静的エクスポート（`output: 'export'`）を使用しているため、
Vercelのエッジネットワークで高速に配信されます。

## コスト

- Vercelの無料プラン（Hobby）で十分動作します
- 商用利用の場合はProプラン（月$20〜）を検討

## サポート

問題が発生した場合：
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)

# ferret One 瞬間概算シミュレーター

ferret Oneの見積もりを簡単に計算・比較できるWebアプリケーションです。

## 機能

- **プラン選択と見積計算**
  - ferret One / for シリーズから選択
  - マーケティングサクセスパック（伴走支援）の追加
  - 制作費の入力
  - 月額・初年度・2年目以降の自動計算

- **既存顧客向け差分計算**
  - 現行プランと提案プランの比較
  - 月額差分、年額差分の表示

- **複数パターンの比較**
  - 最大3パターンまで保存して横並び比較

- **エクスポート機能**
  - CSV/Excelダウンロード
  - クリップボードコピー

## 技術スタック

- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS

## ローカル開発

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## Vercelへのデプロイ

### 方法1: Vercel CLIを使用

```bash
# Vercel CLIのインストール（初回のみ）
npm i -g vercel

# デプロイ
vercel
```

### 方法2: GitHub連携

1. このプロジェクトをGitHubリポジトリにプッシュ
2. [Vercel](https://vercel.com)にログイン
3. "New Project"をクリック
4. GitHubリポジトリを選択
5. "Deploy"をクリック

### 方法3: Vercel Web UI経由

1. プロジェクトをビルド
```bash
npm run build
```

2. [Vercel](https://vercel.com)にログイン
3. "Add New..." > "Project"を選択
4. "Import Git Repository"または手動アップロード

## ビルド

```bash
npm run build
```

静的ファイルは`out`ディレクトリに生成されます。

## ライセンス

Private

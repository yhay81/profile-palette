# プロフパレット

VRChat向けの自己紹介カードを、登録なし・画像アップロードなしで作る日本語Webアプリです。3つのレイアウト、最大3枚の画像、活動時間・興味・フレンド受付状態を編集し、1600×900のPNG保存または端末の共有画面へ渡せます。

Live: https://profile-palette.yusuke8h.workers.dev

入力文字と画像はブラウザ内だけで処理します。サーバーには匿名セッション単位の開始・完成・保存・共有操作だけを35日間保存します。

## Stack

- Cloudflare Workers / D1
- Hono / Hono JSX
- Vite+ / TypeScript / Vitest
- Canvas 2D / vanilla JavaScript

Better Authは使いません。カード生成は永続アカウントを必要とせず、登録が中核jobの摩擦になるためです。

## Local development

```powershell
npm ci
npm run check
npm test
npm run build
npm run dev
```

初回だけローカルD1 migrationを適用します。

```powershell
npx wrangler d1 migrations apply profile-palette --local
```

## Production

```powershell
npx wrangler d1 migrations apply profile-palette --remote
npm run deploy
npm run metrics
```

## Privacy

画像、表示名、X ID、VRChat ID、ひとことはサーバーへ送信しません。詳しくは[PRIVACY.md](./PRIVACY.md)を参照してください。

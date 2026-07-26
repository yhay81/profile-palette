# Stack

## Selected

- Runtime and hosting: Cloudflare Workers
- HTTP and server rendering: Hono / Hono JSX
- Tooling: Vite+ / TypeScript / Oxlint / Oxfmt / Vitest / Wrangler
- Aggregate metrics: Cloudflare D1 with hand-written SQL migration
- Card renderer: browser Canvas 2D and vanilla JavaScript

## Deliberately omitted

- Better Auth: カード作成は一回で完了し、アカウント登録が中核jobの摩擦になる。
- R2: ユーザー画像をアップロードも保存もしない。
- UI framework: 入力状態とCanvas描画だけで成立し、追加ランタイムの利点が小さい。
- Image generation or server conversion: ユーザー自身の画像を端末内で合成する方がプライバシーと費用の両方に適する。
- Payment: 実利用と再利用が確認されるまで課金仮説を追加しない。

## Release gate

1. `npm run check`、`npm test`、`npm run build`、依存監査を通す。
2. D1 migrationをlocalとremoteへ適用する。
3. デスクトップ・モバイルで画像追加、位置調整、3テンプレート、PNG保存、投稿文コピーを確認する。
4. 画像やプロフィール文字がネットワークへ送信されないことを確認する。
5. `npm run metrics`が個別情報なしで5段階の利用漏斗を出すことを確認する。
6. Open Graph画像、canonical URL、`robots.txt`、`sitemap.xml`を本番URLで確認する。

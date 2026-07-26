# Security Policy

## Reporting

脆弱性は公開Issueへ投稿せず、GitHubのprivate vulnerability reportingから報告してください。

## Implemented boundaries

- 画像とプロフィール内容はCanvas 2Dでブラウザ内処理し、サーバーへ送信しない。
- 画像形式をJPG/PNG/WebP、1ファイル20MB以下に限定する。
- イベントAPIは1KB以下のJSON、固定イベント名、UUIDv4、固定テンプレート名だけを受け付ける。
- D1の一意制約で同一セッション・同一日・同一イベントの重複を抑える。
- CSP、frame拒否、MIME sniffing拒否、Permissions Policy、HSTSを設定する。
- 35日を超えた製品イベントを書き込み時に自動削除する。
- 秘密値、プロフィール内容、本番データをGitへ保存しない。

## Known constraints

- ブラウザやCloudflareが提供する短期アクセスログは、D1の製品イベントとは別に存在し得る。
- 匿名セッションIDは人間を厳密に識別せず、端末やブラウザの変更で別利用者として数える。
- 公開ギャラリーとユーザーテンプレート投稿は、権利侵害・不適切表現への対応が必要なため提供しない。

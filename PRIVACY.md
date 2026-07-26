# Privacy

## Browser-only card data

次の情報はブラウザ内だけで処理し、プロフパレットのサーバーへ送信しません。

- 選択した画像とファイル名
- 表示名、X ID、VRChat ID、ひとこと
- 活動時間、興味、フレンド受付状態

画像は端末へ保存しません。プロフィール文字と選択肢は再入力を減らすためlocalStorageへ保存し、画面の「入力をリセット」で削除できます。

## Aggregate product events

品質改善のため、次だけをD1へ保存します。

- ブラウザで生成した無作為な匿名セッションID
- 訪問、編集開始、カード完成、PNG保存、投稿文コピー、別日再訪のイベント種別
- 選択したレイアウト名
- 発生日と記録時刻

カード内容、画像、SNS ID、ファイル名、自由記述、メールアドレス、IPアドレスは製品データベースへ保存しません。イベントは35日を超えたものから自動削除します。

## Operator

- Operator: yhay81
- Security contact: GitHub private vulnerability reporting
- Source: https://github.com/yhay81/profile-palette

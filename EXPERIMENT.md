# Experiment

## User and job

- Target user: Xでフレンド募集や固定ポストを使う日本語VRChatユーザー。
- Job to be done: 実画像とプロフィールを自己紹介カードへまとめ、PNGとしてXへ投稿する。
- Current workaround: Prfmaker、BOOTH/PSDテンプレート、Canva、Excel、既存のVRChatカードメーカー。

## Hypothesis

複数画像、スマホ調整、高解像度PNG、投稿文生成が一画面に揃えば、既存の静的テンプレートより少ない手間で実投稿まで完了する。

## Method

- Recruitment channel: `#VRChat自己紹介カード`、`#VRChatフレンド募集`、個人開発紹介先。
- Participants: 日本語VRChatユーザー30人。
- Duration: 公開から21日。
- Comparison: 現在使っているカード作成手段と、生成完了・実投稿・次回利用意思を比較。

## Decision

- Success signal: 生成完了10件以上、実投稿5件以上、再利用意思3人以上。
- Failure signal: 生成完了5件未満、実投稿2件未満、または主な拒否理由が既存無料ツールで十分に集中。
- Deadline: 2026-08-16。
- Maximum build time: 2日。
- Maximum monthly infrastructure cost: 1,000円。

## Guardrails

- 画像とプロフィール内容をサーバーへ送信しない。
- 実投稿と投稿文コピーを混同しない。公開投稿は別途確認する。
- テンプレート投稿や公開ギャラリーは、権利侵害対応の運用設計ができるまで追加しない。
- 成功条件を途中で都合よく変更しない。

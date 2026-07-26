# Metrics

## Product funnel

| Stage           | D1 state                     | Meaning                                |
| --------------- | ---------------------------- | -------------------------------------- |
| `users`         | `visited`のdistinct session  | 編集画面を開いた                       |
| `activated`     | `started`のdistinct session  | 入力、選択、画像追加のいずれかを始めた |
| `value_created` | `ready`のdistinct session    | 表示名とメイン画像が揃った             |
| `job_completed` | `exported`のdistinct session | 1600×900 PNGを保存した                 |
| `share_intent`  | `shared`のdistinct session   | X投稿文をコピーした                    |
| `returned`      | 2日以上で`exported`          | 別日にカードを書き出した               |

`shared`は投稿文コピーであり、実際のX投稿ではない。公開投稿数はハッシュタグ検索などで別途確認する。

## Operator contract

`npm run metrics`は本番D1から集計し、個別IDやカード内容を含まないJSONだけを標準出力する。分母0の率は0とする。

- Activation: `activated / users`
- Ready: `value_created / activated`
- Completion: `job_completed / value_created`
- Share intent: `share_intent / job_completed`
- Return: `returned / job_completed`
- Seven-day new users and exports

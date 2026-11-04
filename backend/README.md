# 佐藤医院サイト ローカルバックエンド

Docker ComposeでSpring Boot、MySQL、ローカルメール受信箱を起動する学習用バックエンドです。お知らせとお問い合わせを扱います。

## ローカル起動

1. Docker Desktopを起動します。
2. `backend` フォルダで `.env.example` を `.env` にコピーし、ローカル用のパスワードを設定します。
3. `docker compose up --build` を実行します。
4. APIは `http://localhost:8080` で利用できます。
5. Mailpitの受信箱は `http://127.0.0.1:8025` で確認できます。メールはローカルに保存され、外部へ送信されません。
6. 静的サイトもComposeから起動します。Node.jsのインストールは不要です。
7. 管理画面は `http://127.0.0.1:4173/admin.html` からログインします。初期デモIDは `admin`、パスワードは `clinic-demo-change-me` です。`.env` の `ADMIN_USERNAME` / `ADMIN_PASSWORD` で変更できます。

MySQLのデータは `sato-clinic-db` ボリュームに保存されます。通常の停止には `docker compose down` を使ってください。`docker compose down -v` はDBデータを削除するため、意図がない限り実行しないでください。

## お知らせAPI

- `GET /api/news` — 公開中のお知らせ
- `GET /api/admin/news` — 全件一覧（ローカル開発プロファイルのみ）
- `GET /api/admin/news/{id}` — 1件取得（ローカル開発プロファイルのみ）
- `POST /api/admin/news` — 新規作成（ローカル開発プロファイルのみ）
- `PUT /api/admin/news/{id}` — 更新（ローカル開発プロファイルのみ）
- `DELETE /api/admin/news/{id}` — 削除（ローカル開発プロファイルのみ）

## お問い合わせ

- 公開フォーム: `/inquiry.html`
- 個人情報の取扱い草案: `/privacy-policy.html`（医院確認が必要）
- `POST /api/inquiries` — 問い合わせ受付。受付完了メールと医院通知をMailpitへ送信
- `GET /api/admin/inquiries?view=all|deleted` — 管理一覧／削除済み一覧
- `GET /api/admin/inquiries/sent-replies` — 送信済み返信の履歴
- `GET /api/admin/inquiries/{id}` — 詳細と返信履歴
- `PATCH /api/admin/inquiries/{id}/status` — 対応状況の更新
- `POST /api/admin/inquiries/{id}/replies` — 下書き保存または返信送信
- `DELETE /api/admin/inquiries/{id}` — 削除済みへ移動
- `POST /api/admin/inquiries/{id}/restore` — 復元
- `DELETE /api/admin/inquiries/{id}/permanent` — 完全削除

管理APIとお知らせ管理APIは1つのデモ用管理者セッションで保護しています。アカウント登録はありません。ローカル開発プロファイルだけがメール送信を有効にし、ComposeではMailpitだけをSMTPとして使用します。現行のお問い合わせ6件は `local-data.sql` でローカルDBにだけ投入します。

新規作成・更新のJSON項目は `title`、`body`、`category`、`date`（`YYYY-MM-DD`）、`status`（`公開` または `非公開`）、任意の `relatedUrl`、`thumbnailPath` です。

## 現時点の範囲と注意

- 管理一覧と管理ホームのお知らせ欄は `GET /api/admin/news`、トップページと公開お知らせページは `GET /api/news` からDBの内容を読み込みます。各ページを開くたびに最新のDBデータを取得します。
- お知らせの新規作成は `POST /api/admin/news`、編集と一括公開／非公開切替は `PUT /api/admin/news/{id}` に保存します。保存後に一覧へ戻ると、DBから再取得した内容が表示されます。
- Flywayの `V2` でGoogle Sheets由来のお知らせ99件を初期投入します。Google Sheetsとの継続同期は行いません。
- APIを呼び出す管理画面は、`file://` ではなく `http://localhost` または `http://127.0.0.1` のローカルWebサーバーから開いてください。
- 予約管理のDB連携は未実装です。
- 管理画面とAPIはポートフォリオ用のローカル運用を想定しています。実データを保存せず、本番環境へ配置しないでください。
- DBのパスワードは `.env` に置き、Gitへ追加しないでください。`.env.example` は値の形式を示すひな形です。
- 本番用のバックアップ、実運用向けの管理者認証とメール設定、公開時の読み取り専用設定は、公開前の作業項目です。

## DBスキーマ変更

Flywayの適用済みSQLは編集せず、変更が必要な場合は次の番号の `src/main/resources/db/migration/V4__...sql` を追加します。V3で問い合わせと返信のテーブルを作成します。

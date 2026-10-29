# 佐藤医院サイト ローカルバックエンド

Todoプロジェクトと同じく、Docker ComposeでSpring BootとMySQLを起動する学習用バックエンドです。現段階ではお知らせデータだけを扱います。

## ローカル起動

1. Docker Desktopを起動します。
2. `backend` フォルダで `.env.example` を `.env` にコピーし、ローカル用のパスワードを設定します。
3. `docker compose up --build` を実行します。
4. APIは `http://localhost:8080` で利用できます。

MySQLのデータは `sato-clinic-db` ボリュームに保存されます。通常の停止には `docker compose down` を使ってください。`docker compose down -v` はDBデータを削除するため、意図がない限り実行しないでください。

## お知らせAPI

- `GET /api/news` — 公開中のお知らせ
- `GET /api/admin/news` — 全件一覧（ローカル開発プロファイルのみ）
- `GET /api/admin/news/{id}` — 1件取得（ローカル開発プロファイルのみ）
- `POST /api/admin/news` — 新規作成（ローカル開発プロファイルのみ）
- `PUT /api/admin/news/{id}` — 更新（ローカル開発プロファイルのみ）
- `DELETE /api/admin/news/{id}` — 削除（ローカル開発プロファイルのみ）

新規作成・更新のJSON項目は `title`、`body`、`category`、`date`（`YYYY-MM-DD`）、`status`（`公開` または `非公開`）、任意の `relatedUrl`、`thumbnailPath` です。

## 現時点の範囲と注意

- お知らせ新規作成・編集の確認画面からの保存はこのAPIに接続しています。管理一覧・トップページ・公開お知らせページはまだスプレッドシート参照で、DBとの同期は未実装です。
- APIを呼び出す管理画面は、`file://` ではなく `http://localhost` または `http://127.0.0.1` のローカルWebサーバーから開いてください。
- この段階ではスプレッドシートからのデータ移行、管理者ログイン、問い合わせ、予約は未実装です。
- 書き込みAPIは `local` プロファイルでのみ登録され、ポート8080もこのPCのループバックに限定しています。認証を実装するまでは、ポート公開や本番環境への配置をしないでください。
- DBのパスワードは `.env` に置き、Gitへ追加しないでください。`.env.example` は値の形式を示すひな形です。
- 本番用のバックアップ、管理者認証、公開時の読み取り専用設定は、公開前の作業項目です。

## DBスキーマ変更

Flywayの適用済みSQLは編集せず、変更が必要な場合は次の番号の `src/main/resources/db/migration/V2__...sql` を追加します。

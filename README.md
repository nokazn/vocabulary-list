## usage

```Dockerfile
FROM node:12-alpine
ENV PORT=3000
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn --production
COPY . .
CMD ["yarn", "start"]
```

```bash
$ docker build . -t vocabulary-list-app
$ docker run -it -p 3000:3000 vocabulary-list-app
```

GCP プロジェクトを作成しておく。`gcloud` コマンドが手元にインストールされてない場合は適宜[インストール](https://cloud.google.com/sdk/docs/install)する。

```bash
$ PROJECT_ID=vocabulary-list-293610
$ gcloud builds submit --tag=gcr.io/$PROJECT_ID/app --project=$PROJECT_ID
```

Cloud Builds でコンテナをビルドする。数分でビルドが完了し、プロジェクトページの Container Registry に `app` というコンテナイメージが登録されている。

Cound Run のページで `Create Service` を押下する。

Cloud Build で CD の設定をしておくと master ブランチにプッシュする度にデプロイが走るようになる。

```bash
$ yarn add @google-cloud/translate
```

## Cloud SQL for PostgreSQL に接続する

管理画面からインスタンスを適当に作成し、Ｃ loud SQL に接続するためのユーザーアカウントも作成する。

ローカル環境からは [Cloud SQL Proxy](https://cloud.google.com/sql/docs/postgres/quickstart-proxy-test) で接続する。

```bash
$ ./cloud_sql_proxy -instances=vocabulary-list-293610:asia-northeast1:vocabulary-list=tcp:3306
```

pgAdmin でデータベースに接続し、適当にクエリを実行する。

```sql
CREATE TABLE words.words (
  `id` INT NOT NULL AUTO_INCREMENT,
  `ja` VARCHAR(200) NOT NULL,
  `en` VARCHAR(200) NOT NULL,
  `es` VARCHAR(200) NOT NULL,
  `fr` VARCHAR(200) NOT NULL,
  `done` BOOLEAN NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`));
)

INSERT INTO words (id, ja, en, es, fr, done) VALUES (1, '今日', 'today', 'hoy', 'anjourd''hui', false);
INSERT INTO words (id, ja, en, es, fr, done) VALUES (2, '明日', 'tomorrow', 'mañana', 'demain', false);
```

`/words` にアクセスすると、追加したデータが表示されている。

Cloud Run から接続するには、Cloud SQL Proxy を通して UNIX ソケットを用いる。
環境変数を設定する。

```
DB_USER=xxxxx
DB_PASSWORD=xxxxx
DB_NAME=words
DB_PORT=3306
DB_HOST=/cloudsq/<Project ID>:<Region>:<Cloud SQL instance name>
```

## 静的ファイルを Firebase Hosting で配信

```bash
$ npx firebase init --project vocabulary-list-293610
#...
? For which GitHub repository would you like to set up a GitHub workflow? nokazn/vocabulary-list? nokazn/vocabulary-list
#...
```

```diff
+ "build:hosting": "rimraf dist/ && tsc -p ./tsconfig.json"
```

特定のパスへのアクセスは Cloud Run に向ける。

```diff
+ "rewrites": [
+   {
+     "source": "/words/{,/**}",
+     "run": {
+       "serviceId": "vocabulary-list-app",
+       "region": "asia-northeast1"
+     }
+   },
+   {
+     "source": "/translate/**",
+     "run": {
+       "serviceId": "vocabulary-list-app",
+       "region": "asia-northeast1"
+     }
+   },
+   {
+     "source": "**",
+     "destination": "/index.html"
+   }
+ ]
```

https://firebase.google.com/docs/hosting/cloud-run?hl=ja#direct_requests_to_container

## 参考

https://ishida-it.com/blog/post/2020-07-23-cloudrun-nodejs-1/

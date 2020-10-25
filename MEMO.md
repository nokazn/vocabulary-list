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
$ PROJECT_ID=vocabulary-list-29361
$ gcloud builds submit --tag=gcr.io/$PROJECT_ID/app --project=$PROJECT_ID
```

Cloud Builds でコンテナをビルドする。数分でビルドが完了し、プロジェクトページの Container Registry に `app` というコンテナイメージが登録されている。

Cound Run のページで `Create Service` を押下する。

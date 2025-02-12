FROM denoland/deno:2.0.6

WORKDIR /app

COPY . .

RUN deno cache main.ts

CMD ["run", "--allow-all", "--unstable-cron", "main.ts"]
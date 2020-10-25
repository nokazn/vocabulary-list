import express from 'express';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const { PORT } = process.env;
if (PORT == null) {
  console.error({
    env: process.env,
    PORT,
  });
  throw new Error('Environmental variables are not set.');
}

const app = express();

app.use(express.static(path.resolve(__dirname, '../public')));
console.log(path.resolve(__dirname, '../public'));

app.get('/hello', (req, res) => {
  const word = req.query.w;
  res.send(word != null ? `You entered "${word}"!` : 'No words are entered!');
});

app.all('*', (_, res) => {
  res.send(404);
});

app.listen(parseInt(PORT, 10), () => {
  console.log(`The http server is listening at port: ${PORT} 🚀`);
});

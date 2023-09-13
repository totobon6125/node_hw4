import express from 'express';
import cookieParser from 'cookie-parser';

import indexRouter from './routes/index.js';

// .env 설치 해야 배포할 때 문제가 안 생김.


const app = express();
const PORT = process.env.port

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.get("/", (req, res) => {
  return res.json({ message: "환영 합니당!@." })
})

app.use('/api', [indexRouter]);

app.listen(PORT, () => {
  console.log(`${PORT}포트 연결!`);
});


import express, { type Express } from 'express';
import userRouter from './routes/user.js';
import { createUserTable } from './models/user.js';

createUserTable();

const app: Express = express();

app.use(express.json());
app.use((req, res, next) => {
  console.log(`${new Date().toLocaleString()} ${req.method} ${req.url}`);
  next();
});
app.use('/users', userRouter);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(process.env.PORT || 8080, () => {
  console.log(`Server is running on port ${process.env.PORT || 8080}`);
});
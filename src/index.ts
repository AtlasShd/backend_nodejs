import * as dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

import userRouter from './routes/userRouter.js';
import sequelize from './db2.js';
import userModel from './models/userModel.js';
import errorHandler from './middleware/errorHandler.js';
import fileUpload from 'express-fileupload';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());
app.use(express.json());
app.use(fileUpload({}))
app.use(express.static(path.resolve(__dirname, 'static')));
app.use('/api', userRouter);

app.use(errorHandler);

const start = async () => {
  try {
    await sequelize.authenticate();
    // await sequelize.sync();
    await userModel.sync();

    app.listen(PORT, () => console.log(`server is listening on ${PORT}`));
  } catch(e) {
    console.log(e);
  }
}

start();
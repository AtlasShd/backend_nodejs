var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import path, { dirname } from 'path';
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
app.use(fileUpload({}));
app.use(express.static(path.resolve(__dirname, 'static')));
app.use('/api', userRouter);
app.use(errorHandler);
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield sequelize.authenticate();
        // await sequelize.sync();
        yield userModel.sync();
        app.listen(PORT, () => console.log(`server is listening on ${PORT}`));
    }
    catch (e) {
        console.log(e);
    }
});
start();

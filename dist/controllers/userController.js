var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import userModel from '../models/userModel.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
class UserController {
    createUser(req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const image = (_a = req.files) === null || _a === void 0 ? void 0 : _a.image;
                if (!image) {
                    throw new Error('Image does not exist!');
                }
                let imageName = `${uuidv4()}.${image.mimetype.split('/')[1]}`;
                image.mv(path.resolve(__dirname, '..', 'static', imageName));
                const { email, firstName, lastName } = req.body;
                const user = yield userModel.create({ email, firstName, lastName, image: imageName });
                return res.json(user);
            }
            catch (e) {
                next(e);
                console.log(e);
            }
        });
    }
    getOneUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const user = yield userModel.findOne({ where: { id } });
            return res.json(user);
        });
    }
    getUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield userModel.findAll();
            return res.json(users);
        });
    }
    updateUser(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const image = (_a = req.files) === null || _a === void 0 ? void 0 : _a.image;
            if (!image) {
                throw new Error('Image does not exist!');
            }
            let imageName = `${uuidv4()}.${image.mimetype.split('/')[1]}`;
            image.mv(path.resolve(__dirname, '..', 'static', imageName));
            const { id, email, firstName, lastName } = req.body;
            const user = yield userModel.update({ email, firstName, lastName, image: imageName }, { where: { id }, returning: true });
            res.json(user);
        });
    }
    deleteUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const user = yield userModel.findOne({ where: { id } });
            if (user) {
                yield userModel.destroy({ where: { id } });
            }
            return res.json(user);
        });
    }
}
export default new UserController();

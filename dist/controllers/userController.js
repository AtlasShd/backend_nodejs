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
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import Pdfkit from 'pdfkit';
import fs from 'fs';
import ApiError from '../error/ApiError.js';
import userModel from '../models/userModel.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
class UserController {
    createUser(req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, firstName, lastName } = req.body;
                const image = (_a = req.files) === null || _a === void 0 ? void 0 : _a.image;
                if (!validateEmail(email) || !validateLine(firstName) || !validateLine(lastName) || !image) {
                    return next(ApiError.badRequest('Not all fields are filled in correctly!'));
                }
                const imageName = saveImage(image);
                const user = yield userModel.create({ email, firstName, lastName, image: imageName });
                return res.json(user);
            }
            catch (e) {
                next(e);
                console.log(e);
            }
        });
    }
    getOneUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const user = yield userModel.findOne({ where: { id } });
                return res.json(user);
            }
            catch (e) {
                next(e);
                console.log(e);
            }
        });
    }
    getUsers(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield userModel.findAll();
                return res.json(users);
            }
            catch (e) {
                next(e);
                console.log(e);
            }
        });
    }
    updateUser(req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id, email, firstName, lastName } = req.body;
                if (!(validateLine(id) || id == undefined) ||
                    !(validateEmail(email) || email == undefined) ||
                    !(validateLine(firstName) || firstName == undefined) ||
                    !(validateLine(lastName) || lastName == undefined)) {
                    return next(ApiError.badRequest('Not all fields are filled in correctly!'));
                }
                const user = yield userModel.findOne({ where: { id } });
                const image = (_a = req.files) === null || _a === void 0 ? void 0 : _a.image;
                let imageName;
                if (image && user) {
                    deleteFile(user.image);
                    imageName = saveImage(image);
                }
                const updatedUser = yield userModel.update({ email, firstName, lastName, image: imageName }, { where: { id }, returning: true });
                return res.json(updatedUser);
            }
            catch (e) {
                next(e);
                console.log(e);
            }
        });
    }
    deleteUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const user = yield userModel.findOne({ where: { id } });
                if (user) {
                    yield user.destroy();
                }
                return res.json(user);
            }
            catch (e) {
                next(e);
                console.log(e);
            }
        });
    }
    createPdf(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                if (!validateEmail(email)) {
                    return next(ApiError.badRequest('Not all fields are filled in correctly!'));
                }
                const user = yield userModel.findOne({ where: { email } });
                if (!user) {
                    return res.json(false);
                }
                if (user.pdf) {
                    deleteFile(user.pdf);
                }
                const pdfName = savePdf(`${user.firstName} ${user.lastName}`, user.image);
                yield userModel.update({ pdf: pdfName }, { where: { email } });
                return res.json(true);
            }
            catch (e) {
                next(e);
                console.log(e);
            }
        });
    }
}
function saveImage(image) {
    let imageName = `${uuidv4()}.${image.mimetype.split('/')[1]}`;
    image.mv(path.resolve(__dirname, '..', 'static', imageName));
    return imageName;
}
function savePdf(text, image) {
    const pdfName = `${uuidv4()}.pdf`;
    const pdfDoc = new Pdfkit;
    pdfDoc.pipe(fs.createWriteStream(path.resolve(__dirname, '..', 'static', pdfName)));
    pdfDoc.text(text);
    const filePath = path.resolve(__dirname, '..', 'static', image);
    if (fs.existsSync(filePath)) {
        pdfDoc.image(filePath, { cover: [450, 150], align: 'center' });
    }
    pdfDoc.end();
    return pdfName;
}
function deleteFile(file) {
    const filePath = path.resolve(__dirname, '..', 'static', file);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
}
function validateEmail(email) {
    if (email == undefined) {
        return false;
    }
    const EMAIL_REGEXP = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/iu;
    return EMAIL_REGEXP.test(email);
}
function validateLine(line) {
    if (line == undefined) {
        return false;
    }
    const LINE_REGEXP = /^[a-zA-Z0-9]+$/;
    return LINE_REGEXP.test(line);
}
export default new UserController();

import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import Pdfkit from 'pdfkit';
import fs from 'fs';

import ApiError from '../error/ApiError.js';
import userModel from '../models/userModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

type imageData = {
  name: string,
  data: Buffer,
  size: number,
  encoding: string,
  tempFilePath: string,
  truncated: boolean,
  mimetype: string,
  md5: string,
  mv: (str: string) => {}
}

type userData = {
  id: number,
  email: string,
  firstName: string,
  lastName: string,
  image: string,
  pdf: string,
}

class UserController {
  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, firstName, lastName } = req.body;
      const image = req.files?.image as imageData;

      if (!validateEmail(email) || !validateLine(firstName) || !validateLine(lastName) || !image) {
        return next(ApiError.badRequest('Not all fields are filled in correctly!'));
      }

      const imageName = saveImage(image);

      const user = await userModel.create({ email, firstName, lastName, image: imageName });
  
      return res.json(user);
    } catch (e) {
      next(e);
      console.log(e); 
    }

    
  }

  async getOneUser(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;

      const user = await userModel.findOne({ where: { id } });
    
      return res.json(user);
    } catch (e) {
      next(e);
      console.log(e);
    }
  }

  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userModel.findAll();
    
      return res.json(users);
    } catch (e) {
      next(e);
      console.log(e);
    }
  }
  
  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, email, firstName, lastName } = req.body;
      if (
      !(validateLine(id) || id == undefined) || 
      !(validateEmail(email) || email == undefined) || 
      !(validateLine(firstName) || firstName == undefined) || 
      !(validateLine(lastName) || lastName == undefined)) {
        return next(ApiError.badRequest('Not all fields are filled in correctly!'));
      }

      const user = await userModel.findOne({ where: { id } }) as userData | null;
      const image = req.files?.image as imageData;
      let imageName;
      if (image && user) {
        deleteFile(user.image);
        imageName = saveImage(image);
      }

      const updatedUser = await userModel.update({ email, firstName, lastName, image: imageName }, { where: { id }, returning: true });

      return res.json(updatedUser);
    } catch (e) {
      next(e);
      console.log(e);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;

      const user = await userModel.findOne({ where: { id } });

      if (user) {
        await user.destroy();
      }

      return res.json(user);
    } catch (e) {
      next(e);
      console.log(e);
    }
  }

  async createPdf(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      if (!validateEmail(email)) {
        return next(ApiError.badRequest('Not all fields are filled in correctly!'));
      }

      const user = await userModel.findOne({ where: { email } }) as userData | null;

      if (!user) {
        return res.json(false);
      }

      if (user.pdf){
        deleteFile(user.pdf);
      }
      const pdfName = savePdf(`${user.firstName} ${user.lastName}`, user.image);

      await userModel.update({ pdf: pdfName }, { where: { email } });
      return res.json(true);
    } catch (e) {
      next(e);
      console.log(e);
    }
  }
}


function saveImage(image: imageData) {
  let imageName = `${uuidv4()}.${image.mimetype.split('/')[1]}`;
  image.mv(path.resolve(__dirname, '..', 'static', imageName));

  return imageName;
}

function savePdf(text: string, image: string) {
  const pdfName = `${uuidv4()}.pdf`;

  const pdfDoc = new Pdfkit;
  pdfDoc.pipe(fs.createWriteStream(path.resolve(__dirname, '..', 'static', pdfName)));
  pdfDoc.text(text);
  const filePath = path.resolve(__dirname, '..', 'static', image);

  if (fs.existsSync(filePath)) {
    pdfDoc.image(filePath, {cover: [450, 150], align: 'center'});
  }
  pdfDoc.end();

  return pdfName;
}

function deleteFile(file: string) {
  const filePath = path.resolve(__dirname, '..', 'static', file);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

function validateEmail(email: string) {
  if (email == undefined) {
    return false;
  }

  const EMAIL_REGEXP = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/iu;

  return EMAIL_REGEXP.test(email);
}

function validateLine(line: string) {  
  if (line == undefined) {
    return false;
  }

  const LINE_REGEXP = /^[a-zA-Z0-9]+$/;

  return LINE_REGEXP.test(line);
}

export default new UserController();
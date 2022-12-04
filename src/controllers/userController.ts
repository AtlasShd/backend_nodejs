import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { dirname } from 'path';
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
  md5: 'string',
  mv: (str: string) => {}
} | null

type userData = {
  id: number,
  email: string,
  firstName: string,
  lastName: string,
  image: string,
  pdf: string,
} | null

class UserController {
  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const image = req.files?.image as imageData;
      if (!image) {
        throw new Error('Image does not exist!');
      }

      let imageName = `${uuidv4()}.${image.mimetype.split('/')[1]}`;
      image.mv(path.resolve(__dirname, '..', 'static', imageName));

      const { email, firstName, lastName } = req.body;
  
      const user = await userModel.create({ email, firstName, lastName, image: imageName });
  
      return res.json(user);
    } catch (e) {
      next(e);
      console.log(e);
    }

    
  }

  async getOneUser(req: Request, res: Response) {

    const id = req.params.id;

    const user = await userModel.findOne(
      {where: {id}}
    );
    
    return res.json(user);
  }

  async getUsers(req: Request, res: Response) {

    const users = await userModel.findAll();
    
    return res.json(users);
  }
  
  async updateUser(req: Request, res: Response) {
    
    const image = req.files?.image as imageData;
    let imageName;

    if (image) {
      imageName = `${uuidv4()}.${image.mimetype.split('/')[1]}`;
      image.mv(path.resolve(__dirname, '..', 'static', imageName));
    }

    const { id, email, firstName, lastName } = req.body;

    const user = await userModel.update({ email, firstName, lastName, image: imageName }, { where: { id }, returning: true });
    
    res.json(user);
  }

  async deleteUser(req: Request, res: Response) {
    const id = req.params.id;

    const user = await userModel.findOne({ where: { id } });

    if (user) {
      await userModel.destroy({ where: { id } });
    }

    return res.json(user);
  }

  async createPdf(req: Request, res: Response) {
    const { email } = req.body;

    const user = await userModel.findOne({ where: { email } }) as userData;

    if (!user) {
      return res.json(false);
    }

    if (user.pdf){
      fs.unlink(path.resolve(__dirname, '..', 'static', user.pdf), (e) => {
        if (e) {
          console.log(e);
        }
      })
    }

    const pdfDoc = new Pdfkit;
    const pdfName = `${uuidv4()}.pdf`;

    pdfDoc.pipe(fs.createWriteStream(path.resolve(__dirname, '..', 'static', pdfName)));
    pdfDoc.text(`${user.firstName} ${user.lastName}`);
    pdfDoc.image(path.resolve(__dirname, '..', 'static', user.image), {cover: [450, 150], align: 'center'});
    pdfDoc.end();

    await userModel.update({ pdf: pdfName }, { where: { email }});

    return res.json(true);
  }
}

export default new UserController();
import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

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
}

class UserController {
  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const image = req.files?.image as unknown as imageData;
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
    
    const image = req.files?.image as unknown as imageData;
    if (!image) {
      throw new Error('Image does not exist!');
    }

    let imageName = `${uuidv4()}.${image.mimetype.split('/')[1]}`;
    image.mv(path.resolve(__dirname, '..', 'static', imageName));

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
}

export default new UserController();
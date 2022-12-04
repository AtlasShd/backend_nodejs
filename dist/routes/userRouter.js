import express from 'express';
import userController from '../controllers/userController.js';
const router = express();
router.post('/user', userController.createUser);
router.get('/user/:id', userController.getOneUser);
router.get('/user', userController.getUsers);
router.put('/user', userController.updateUser);
router.delete('/user/:id', userController.deleteUser);
export default router;

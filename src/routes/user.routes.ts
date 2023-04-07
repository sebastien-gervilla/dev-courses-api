// Default imports
import express from 'express';

// Controller imports
import { 
    getUsers, getUser,
    createUser, 
    updateUser, 
    deleteUser,
    login, logout, authenticate,
    changePassword, requestResetPassword, resetPassword
} from '../controllers/user.controller';
import { isAuth, isAdmin } from '../middlewares/auth.middleware';
import { userValidations } from '../models/user.model';

const Router = express.Router();

Router.get('/', isAuth, isAdmin, getUsers);
Router.post('/', userValidations, createUser);

Router.get('/auth', isAuth, authenticate);
Router.post('/login', login);
Router.post('/logout', logout);

Router.get('/:id', getUser);
Router.put('/:id', userValidations, updateUser);
Router.delete('/:id', deleteUser);

Router.put('/:id/change-password', changePassword);
Router.post('/:id/request-password-reset', requestResetPassword);
Router.put('/:id/reset-password/:token', resetPassword);

export default Router;
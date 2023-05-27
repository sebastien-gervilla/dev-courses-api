// Default imports
import express from 'express';

// Controller imports
import { 
    getTutorials, getTutorial,
    createTutorial, followTutorial,
    updateTutorial,
    deleteTutorial
} from '../controllers/tutorial.controller';
import { isAuth, isAdmin } from '../middlewares/auth.middleware';

const Router = express.Router();

Router.get('/', getTutorials);
Router.post('/', isAuth, isAdmin, createTutorial);

Router.get('/:slug', isAuth, getTutorial);

Router.post('/:id/follow', isAuth, followTutorial)
Router.put('/:id', isAuth, isAdmin, updateTutorial);
Router.delete('/:id', isAuth, isAdmin, deleteTutorial);

export default Router;
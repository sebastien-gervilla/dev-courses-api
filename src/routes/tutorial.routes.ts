// Default imports
import express from 'express';

// Controller imports
import { 
    getTutorials, getTutorial,
    createTutorial
    deleteTutorial
} from '../controllers/tutorial.controller';
import { isAuth, isAdmin } from '../middlewares/auth.middleware';

const Router = express.Router();

Router.get('/', getTutorials);
Router.post('/', isAuth, isAdmin, createTutorial);

Router.get('/:slug', getTutorial);

Router.delete('/:id', isAuth, isAdmin, deleteTutorial);

export default Router;
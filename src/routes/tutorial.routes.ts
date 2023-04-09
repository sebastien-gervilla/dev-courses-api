// Default imports
import express from 'express';

// Controller imports
import { 
    getTutorials, getTutorial,
    createTutorial
} from '../controllers/tutorial.controller';
import { isAuth, isAdmin } from '../middlewares/auth.middleware';

const Router = express.Router();

Router.get('/', getTutorials);
Router.post('/', createTutorial);

Router.get('/:slug', getTutorial);

export default Router;
// Default imports
import express from 'express';

// Controller imports
import { 
    getTutorials, getTutorial, getTutorialById, getTutorialPreview, isTutorialCompleted,
    createTutorial, followTutorial, completeTutorial,
    updateTutorial,
    deleteTutorial
} from '../controllers/tutorial.controller';
import { isAuth, isAdmin } from '../middlewares/auth.middleware';

const Router = express.Router();

Router.get('/', getTutorials);
Router.post('/', isAuth, isAdmin, createTutorial);

Router.get('/:slug', isAuth, getTutorial);
Router.get('/:slug/preview', isAuth, getTutorialPreview);
Router.get('/:slug/isCompleted', isAuth, isTutorialCompleted);

Router.post('/:id/follow', isAuth, followTutorial);
Router.post('/:id/complete', isAuth, completeTutorial);
Router.put('/:id', isAuth, isAdmin, updateTutorial);
Router.delete('/:id', isAuth, isAdmin, deleteTutorial);

Router.get('/editor/:id', isAuth, isAdmin, getTutorialById);

export default Router;

import express from 'express';

const router = express.Router();
import Signup from '../controllers/signup';
import LogOut from '../controllers/Logut';
import Login from '../controllers/login';
import { newRefresh } from '../controllers/refreshPoint';

router.post('/Signup', Signup);
router.post('/Login', Login);
router.post('/LogOut', LogOut);

// Aliases and refresh endpoints
router.post('/signup', Signup);
router.post('/login', Login);
router.post('/logout', LogOut);
router.post('/refreshPoint', newRefresh);
router.post('/refresh', newRefresh);

export default router;
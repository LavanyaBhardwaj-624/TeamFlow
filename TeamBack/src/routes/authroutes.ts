
import express from 'express';

const router = express.Router();
import Signup from '../controllers/signup.ts';
import LogOut from '../controllers/Logut.ts';
import Login from '../controllers/login.ts';
import { newRefresh } from '../controllers/refreshPoint.ts';
import { authenticate } from '../middleware/authenticate.ts';
import getAllMember from '../controllers/getAllUsers.ts';
import updateProfile from '../controllers/updateProfile.ts';

router.post('/Signup', Signup);
router.post('/Login', Login);
router.post('/LogOut', LogOut);

// Aliases and refresh endpoints
router.post('/signup', Signup);
router.post('/login', Login);
router.post('/logout', LogOut);
router.post('/refreshPoint', newRefresh);
router.post('/refresh', newRefresh);


router.get('/getAllUsers' , authenticate , getAllMember);
router.patch('/profile', authenticate, updateProfile);
export default router;

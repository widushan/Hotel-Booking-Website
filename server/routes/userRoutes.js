import express from "express";
import { protect, protectCreate } from "../middleware/authMiddleware.js";
import { getUserData, storeRecentSearchedCities, createUser, createUserManually, fixExistingUsers } from "../controllers/userController.js";

const UserRouter = express.Router();

UserRouter.get('/', protect, getUserData);
UserRouter.post('/store-recent-search', protect, storeRecentSearchedCities);
UserRouter.post('/create', protectCreate, createUser); // Use protectCreate middleware for user creation
UserRouter.post('/create-manual', createUserManually); // No auth required for manual creation
UserRouter.post('/fix-users', fixExistingUsers); // Fix existing users

export default UserRouter;
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getUserData, storeRecentSearchedCities, createUser, createUserManually } from "../controllers/userController.js";

const UserRouter = express.Router();

UserRouter.get('/', protect, getUserData);
UserRouter.post('/store-recent-search', protect, storeRecentSearchedCities);
UserRouter.post('/create', protect, createUser);
UserRouter.post('/create-manual', createUserManually); // No auth required for manual creation

export default UserRouter;
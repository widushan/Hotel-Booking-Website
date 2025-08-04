import express from 'express';
import {
  checkAvailabilityAPI,
  createBooking,
  getHotelBookings,
  getUserBookings,
  stripePayment,
  stripeWebhook
} from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';

const bookingRouter = express.Router();

bookingRouter.post('/check-availability', checkAvailabilityAPI);
bookingRouter.post('/book', protect, createBooking);
bookingRouter.get('/user', protect, getUserBookings);
bookingRouter.get('/hotel', protect, getHotelBookings);

bookingRouter.post('/stripe-payment', protect, stripePayment);
bookingRouter.post('/stripe-webhook', express.raw({ type: 'application/json' }), stripeWebhook);

export default bookingRouter;

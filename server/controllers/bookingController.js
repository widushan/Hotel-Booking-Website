import Booking from "../models/Booking.js";
import Room from "../models/Room.js";
import Hotel from "../models/Hotel.js";
import transporter from "../configs/nodemailer.js";

import stripe from 'stripe';

// Function to Check Availability of Room
const checkAvailability = async ({ checkInDate, checkOutDate, room }) => {
  try {
    const bookings = await Booking.find({
      room,
      checkInDate: { $lte: checkOutDate },
      checkOutDate: { $gte: checkInDate },
    });

    const isAvailable = bookings.length === 0;
    return isAvailable;
  } catch (error) {
    console.error(error.message);
  }
};



// API to check availability of room
// POST /api/bookings/check-availability
export const checkAvailabilityAPI = async (req, res) => {
  try {
    const { room, checkInDate, checkOutDate } = req.body;
    const isAvailable = await checkAvailability({
      checkInDate,
      checkOutDate,
      room,
    });
    res.json({ success: true, isAvailable });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};



// API to create a new booking
// POST /api/bookings/book
export const createBooking = async (req, res) => {
    try {
        const { checkInDate, checkOutDate, room, guests } = req.body;
        const user = req.user._id;
        const isAvailable = await checkAvailability({
            checkInDate,
            checkOutDate,
            room,
        });
        if (!isAvailable) {
            return res.json({ success: false, message: "Room is not available" });
        }
        // Get totalPrice from Room
        const roomData = await Room.findById(room).populate("hotel");
        let totalPrice = roomData.pricePerNight;

        // Calculate totalPrice based on nights
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const timeDiff = checkOut.getTime() - checkIn.getTime();
        const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));

        totalPrice *= nights;

        const booking = await Booking.create({
            user,
            room,
            hotel: roomData.hotel._id,
            checkInDate,
            checkOutDate,
            totalPrice,
            guests: +guests,
        });

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: req.user.email,
            subject: "Booking Confirmation",
            html: `
              <h2>Your Booking Details</h2>
              <p>Dear ${req.user.username},</p>
              <p>Thank you for your booking! Here are your details:</p>
              <ul>
                <li><strong>Booking ID:</strong> ${booking._id}</li>
                <li><strong>Hotel Name:</strong> ${roomData.hotel.name}</li>
                <li><strong>Location:</strong> ${roomData.hotel.address}</li>
                <li><strong>Check-In Date:</strong> ${booking.checkInDate.toDateString()}</li>
                <li><strong>Check-Out Date:</strong> ${booking.checkOutDate.toDateString()}</li>
                <li><strong>Booking Amount:</strong> ${process.env.CURRENCY || 'Rs'} ${booking.totalPrice}/night</li>
              </ul>
              <p>We look forward to welcoming you!</p>
              <p>If you need to make any changes, feel free to contact us.</p>
            `
        }

        await transporter.sendMail(mailOptions)

        res.json({ success: true, message: "Booking created successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Failed to create booking" });
    }
};




// API to get all bookings for a user
// GET /api/bookings/user
export const getUserBookings = async (req, res) => {
  try {
    const user = req.user._id;
    const bookings = await Booking.find({ user })
      .populate("room hotel")
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (error) {
    res.json({ success: false, message: "Failed to fetch bookings" });
  }
};




export const getHotelBookings = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ owner: req.auth.userId });
  if (!hotel) {
    return res.json({ success: false, message: "No Hotel found" });
  }

  const bookings = await Booking.find({ hotel: hotel._id })
    .populate("room hotel user")
    .sort({ createdAt: -1 });

  // Total Bookings
  const totalBookings = bookings.length;

  // Total Revenue
  const totalRevenue = bookings.reduce((acc, booking) => acc + booking.totalPrice, 0);

  res.json({
    success: true,
    dashboardData: {
      totalBookings,
      totalRevenue,
      bookings
    },
  })

  } catch (error) {
    res.json({ success: false, message: "Failed to fetch bookings" })
  }
};



export const stripePayment = async (req, res) => {
  try {
    console.log("=== STRIPE PAYMENT STARTED ===");
    
    // Check if Stripe secret key is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("❌ STRIPE_SECRET_KEY is not configured");
      return res.json({ 
        success: false, 
        message: "Payment service is not configured. Please contact support." 
      });
    }

    const { bookingId } = req.body;
    console.log("Booking ID:", bookingId);

    if (!bookingId) {
      return res.json({ 
        success: false, 
        message: "Booking ID is required" 
      });
    }

    // Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      console.error("❌ Booking not found:", bookingId);
      return res.json({ 
        success: false, 
        message: "Booking not found" 
      });
    }

    // Check if booking belongs to the authenticated user
    if (booking.user.toString() !== req.user._id.toString()) {
      console.error("❌ Unauthorized access to booking");
      return res.json({ 
        success: false, 
        message: "Unauthorized access to this booking" 
      });
    }

    // Check if booking is already paid
    if (booking.isPaid) {
      return res.json({ 
        success: false, 
        message: "This booking is already paid" 
      });
    }

    const roomData = await Room.findById(booking.room).populate("hotel");
    if (!roomData) {
      console.error("❌ Room not found for booking");
      return res.json({ 
        success: false, 
        message: "Room information not found" 
      });
    }

    const totalPrice = booking.totalPrice;
    console.log("Total price:", totalPrice);

    const { origin } = req.headers;
    console.log("Origin:", origin);

    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    const line_items = [
      {
        price_data: {
          currency: 'lkr', 
          product_data: {
            name: `Booking for ${roomData.hotel.name}`,
            description: `Room: ${roomData.roomType}, Check-in: ${booking.checkInDate.toDateString()}, Check-out: ${booking.checkOutDate.toDateString()}`,
          },
          unit_amount: Math.round(totalPrice * 100), // Convert to cents and round
        },
        quantity: 1,
      }
    ];

    console.log("Creating Stripe checkout session...");
    
    // Create a Checkout Session
    const session = await stripeInstance.checkout.sessions.create({
      line_items,
      mode: 'payment',
      success_url: `${origin}/my-bookings?success=true`,
      cancel_url: `${origin}/my-bookings?canceled=true`,
      metadata: {
        bookingId: bookingId,
        userId: booking.user.toString(),
      },
    });

    console.log("✅ Stripe session created successfully:", session.id);
    res.json({ success: true, url: session.url });

  } catch (error) {
    console.error("❌ Stripe payment error:", error);
    
    if (error.type === 'StripeCardError') {
      return res.json({ 
        success: false, 
        message: "Payment failed: " + error.message 
      });
    } else if (error.type === 'StripeInvalidRequestError') {
      return res.json({ 
        success: false, 
        message: "Invalid payment request" 
      });
    } else {
      return res.json({ 
        success: false, 
        message: "Payment processing failed. Please try again." 
      });
    }
  }
}


export const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify webhook signature
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
    event = stripeInstance.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      
      try {
        // Update booking status to paid
        const bookingId = session.metadata.bookingId;
        await Booking.findByIdAndUpdate(bookingId, { isPaid: true });
        
        console.log(`✅ Booking ${bookingId} marked as paid`);
        
        // Send confirmation email
        const booking = await Booking.findById(bookingId).populate('user room hotel');
        if (booking) {
          const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: booking.user.email,
            subject: "Payment Confirmation - Booking Successful",
            html: `
              <h2>Payment Confirmation</h2>
              <p>Dear ${booking.user.username},</p>
              <p>Your payment has been processed successfully!</p>
              <h3>Booking Details:</h3>
              <ul>
                <li><strong>Booking ID:</strong> ${booking._id}</li>
                <li><strong>Hotel:</strong> ${booking.hotel.name}</li>
                <li><strong>Room:</strong> ${booking.room.roomType}</li>
                <li><strong>Check-in:</strong> ${booking.checkInDate.toDateString()}</li>
                <li><strong>Check-out:</strong> ${booking.checkOutDate.toDateString()}</li>
                <li><strong>Amount Paid:</strong> Rs.${booking.totalPrice}</li>
              </ul>
              <p>Thank you for choosing our service!</p>
            `
          };
          
          await transporter.sendMail(mailOptions);
        }
      } catch (error) {
        console.error('❌ Error processing webhook:', error);
      }
      break;
      
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};






# Server Setup Guide

## Required Environment Variables

Create a `.env` file in the server directory with the following variables:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017
# or for MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net

# Clerk Authentication
CLERK_SECRET_KEY=your_clerk_secret_key_here
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here

# Stripe Payment Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here

# Currency Configuration
CURRENCY=inr
# Available options: inr, usd, eur, gbp, lkr, sgd

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Configuration (for booking confirmations)
SENDER_EMAIL=your_email@gmail.com
SENDER_PASSWORD=your_app_password

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173

# Environment
NODE_ENV=development

# Port (optional - defaults to 3000)
PORT=3000
```

## Setup Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up MongoDB:**
   - Install MongoDB locally, or
   - Use MongoDB Atlas (cloud service)

3. **Set up Clerk:**
   - Go to [clerk.com](https://clerk.com)
   - Create a new application
   - Get your secret key and publishable key
   - Add them to your .env file

4. **Set up Stripe:**
   - Go to [stripe.com](https://stripe.com)
   - Create a free account
   - Get your secret key and publishable key from the dashboard
   - Add them to your .env file
   - **Important**: Use test keys for development

5. **Configure Currency:**
   - Set `CURRENCY` in your .env file to your preferred currency
   - Available options: `inr`, `usd`, `eur`, `gbp`, `lkr`, `sgd`
   - Make sure your Stripe account supports the chosen currency

6. **Set up Cloudinary:**
   - Go to [cloudinary.com](https://cloudinary.com)
   - Create a free account
   - Get your cloud name, API key, and API secret
   - Add them to your .env file

7. **Set up Email (optional):**
   - For Gmail, use an App Password
   - For other providers, use your email credentials

8. **Start the server:**
   ```bash
   npm run server
   ```

## Troubleshooting

### Database Connection Issues
- Make sure MongoDB is running
- Check your MONGODB_URI is correct
- For Atlas, ensure your IP is whitelisted

### Authentication Issues
- Verify your CLERK_SECRET_KEY is correct
- Make sure the key is from the correct environment (development/production)
- Check that Clerk is properly configured in your frontend

### Payment Issues
- Ensure STRIPE_SECRET_KEY is set correctly
- Use test keys for development
- Check Stripe dashboard for any errors
- Verify the currency is supported by your Stripe account
- **Currency Error Fix**: Make sure to use valid Stripe currency codes (e.g., 'inr' not 'rs')

### Currency Issues
- Use valid currency codes: `inr`, `usd`, `eur`, `gbp`, `lkr`, `sgd`
- Ensure your Stripe account supports the chosen currency
- Check that both server and client have the same currency configuration

### CORS Issues
- Ensure CLIENT_URL matches your frontend URL
- Check that credentials are enabled in your frontend requests 
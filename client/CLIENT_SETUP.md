# Client Setup Guide

## Required Environment Variables

Create a `.env` file in the client directory with the following variables:

```env
# Backend API URL
VITE_BACKEND_URL=http://localhost:3000

# Currency Configuration
VITE_CURRENCY=inr
# Available options: inr, usd, eur, gbp, lkr, sgd

# Clerk Configuration (if needed)
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
```

## Setup Steps

1. **Create the .env file** in the client directory with the above content
2. **Make sure the backend server is running** on port 3000
3. **Start the client:**
   ```bash
   npm run dev
   ```

## Troubleshooting

### Connection Timeout Issues
- Ensure the backend server is running on port 3000
- Check that VITE_BACKEND_URL is set correctly
- Verify there are no firewall issues blocking localhost:3000

### Authentication Issues
- Make sure your Clerk publishable key is correct
- Ensure the backend has the matching Clerk secret key

### Currency Issues
- Use valid currency codes: `inr`, `usd`, `eur`, `gbp`, `lkr`, `sgd`
- Make sure the currency matches between client and server
- The currency symbol will automatically update based on your configuration 
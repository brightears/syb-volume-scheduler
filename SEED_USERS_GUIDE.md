# How to Seed Initial Users

After the authentication system is deployed, you need to create the initial users.

## Steps:

1. Go to your Render dashboard
2. Select your **web service** (not the background worker)
3. Click on the "Shell" tab
4. Run these commands:

```bash
# Navigate to the web directory
cd web

# Install dependencies if needed
npm install

# Run the seed script
node scripts/seed-users.js
```

## What it creates:

1. **Admin User**
   - Email: admin@syb.com
   - Password: admin123
   - Can access ALL accounts

2. **Client User**
   - Email: hilton@example.com
   - Password: hilton123
   - Can only access Hilton Pattaya account

3. **Demo Accounts**
   - Marriott Bangkok
   - Novotel Sukhumvit
   - InterContinental Bangkok
   (For admin testing)

## Troubleshooting:

If you get "Cannot find module" error:
- Make sure you're in the `/web` directory
- Run `pwd` to check your current directory
- It should show something like `/opt/render/project/src/web`

If you get database errors:
- Check that DATABASE_URL is set in your environment variables
- Ensure the database is accessible
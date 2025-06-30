# User Management Guide

## Overview
This guide explains how to manage users and accounts in the SYB Volume Scheduler platform.

## Admin Access

### Login as Admin
- URL: https://syb-volume-scheduler.onrender.com/login
- Email: admin@syb.com
- Password: admin123

### Admin Capabilities
- View and manage ALL client accounts
- Create new accounts by importing from Soundtrack
- Create users for any account
- Switch between accounts to view their dashboards
- Delete users and manage access

## Managing Client Accounts

### 1. Adding a New Client Account

1. Login as admin
2. Click "Admin Panel" in the top right
3. Click "Add Account"
4. Enter the client's Soundtrack account ID
   - Example: `QWNjb3VudCwsMXN4N242NTZyeTgv`
   - You can get this from the Soundtrack API or the client
5. Click "Import Account"
6. The system will fetch the account name and create it

### 2. Creating Users for Clients

1. In the Admin Panel, find the client account
2. Click the "Users" button
3. Click "Add User"
4. Fill in:
   - **Email**: The client's email address
   - **Name**: Optional display name
   - **Password**: Click "Generate" for a secure password
5. Click the copy button to copy the password
6. Click "Create User"

### 3. Sharing Login Details with Clients

Send the client:
```
Volume Scheduler Access

Login URL: https://syb-volume-scheduler.onrender.com/login
Email: [the email you created]
Password: [the generated password]

Once logged in, you can:
- View all your sound zones
- Create volume schedules for each zone
- Set different volumes for different times of day
- Schedules run automatically every minute
```

## Client Experience

### What Clients See
- Only their own account (no account switcher)
- All zones for their locations
- Schedule editor for each zone
- No admin features or other accounts

### What Clients Can Do
- Create time-based volume rules
- Set baseline volumes
- Test volume changes
- View active schedules
- Logout when done

## Security Features

### Password Requirements
- Generated passwords are 12 characters
- Include uppercase, lowercase, numbers, and symbols
- No ambiguous characters (0, O, l, 1)
- Stored securely with bcrypt hashing

### Session Management
- Sessions expire after 7 days
- Users must re-login after expiration
- Admins can delete users to revoke access
- One session per login (no sharing)

## Troubleshooting

### Client Can't Login
1. Check email is correct (case-insensitive)
2. Verify password was entered correctly
3. Check if user is marked as active
4. Try deleting and recreating the user

### Client Sees Wrong Account
1. Verify their user is assigned to correct account
2. Check they're not using an admin account
3. Clear browser cache/cookies

### Volume Changes Not Working
1. Ensure schedule is saved
2. Check scheduler service is running
3. Verify zone IDs are correct
4. Check API token has volume control permission

## Best Practices

### For Admins
1. Use descriptive names when creating accounts
2. Generate passwords rather than creating simple ones
3. Document which users belong to which client
4. Regularly review and remove unused accounts

### For Clients
1. Change password on first login (when feature added)
2. Don't share login credentials
3. Create meaningful schedule names
4. Test volume changes before relying on schedules

## Advanced Features (Coming Soon)

### Planned Enhancements
1. Password reset via email
2. Two-factor authentication
3. Multiple users per client account
4. Audit logs for changes
5. Email notifications for schedule changes
6. API access for enterprise clients

## Support

For technical issues:
- Check the background scheduler logs in Render
- Verify database connections are active
- Ensure API tokens are valid

For business inquiries:
- Account setup and pricing
- Custom feature requests
- Enterprise API access
# Cart Abandonment Email Setup

This document explains how to set up the cart abandonment email functionality in your ecommerce application.

## Features

- **Automated Email Reminders**: Sends professional cart abandonment emails at 24 hours, 72 hours, and 7 days
- **Professional Email Templates**: Beautiful, responsive HTML email templates with product images and pricing
- **Smart Tracking**: Tracks cart updates and only sends emails to users with abandoned carts
- **Admin Dashboard**: Admin endpoints to monitor and manage cart abandonment campaigns
- **Automatic Cleanup**: Removes old records to keep the database clean

## Email Schedule

1. **First Reminder**: 24 hours after cart abandonment
2. **Second Reminder**: 72 hours (3 days) after cart abandonment  
3. **Final Reminder**: 168 hours (7 days) after cart abandonment

## Setup Instructions

### 1. Install Dependencies

The following packages have been added to `package.json`:
- `nodemailer`: For sending emails
- `node-cron`: For scheduling automated tasks

Run the following command to install:
```bash
cd backend
npm install
```

### 2. Database Setup

The following table has been added to your database schema:

```sql
CREATE TABLE cart_abandonment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    cart_data JSON NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    email_sent_at TIMESTAMP NULL,
    email_type ENUM('first_reminder', 'second_reminder', 'final_reminder') NULL,
    is_purchased TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

Run the migration to add this table to your database.

### 3. Environment Variables

Add the following environment variables to your `.env` file:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Store Configuration
STORE_NAME=Your E-commerce Store
FRONTEND_URL=http://localhost:3000
SUPPORT_EMAIL=support@yourstore.com
```

### 4. Email Service Setup

#### For Gmail:
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this password in `SMTP_PASS`

#### For Other Email Providers:
Update the SMTP configuration in `backend/services/emailService.js`:

```javascript
this.transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});
```

### 5. Start the Application

The cart abandonment functionality starts automatically when you start the server:

```bash
cd backend
npm start
```

## How It Works

### 1. Cart Tracking
- Every time a user adds, updates, or removes items from their cart, the system tracks this activity
- Cart data is stored in the `cart_abandonment` table with a timestamp

### 2. Email Scheduling
- A cron job runs every 6 hours to check for abandoned carts
- Emails are sent based on the time elapsed since the last cart update:
  - 24 hours: First reminder
  - 72 hours: Second reminder  
  - 7 days: Final reminder

### 3. Email Content
Each email includes:
- Personalized greeting with user's name
- Product images and details from their cart
- Total amount
- Call-to-action button to complete purchase
- Store benefits and guarantees
- Professional styling and responsive design

### 4. Purchase Tracking
- When a user completes a purchase, their cart abandonment record is marked as purchased
- No further emails will be sent to users who have completed their purchase

## Admin Endpoints

The following admin endpoints are available for managing cart abandonment:

### Get Statistics
```
GET /api/cart-abandonment/stats
```
Returns abandonment statistics including total abandoned carts, emails sent, and recovery rates.

### Trigger Manual Check
```
POST /api/cart-abandonment/trigger-check
```
Manually triggers the cart abandonment check process.

### Trigger Cleanup
```
POST /api/cart-abandonment/trigger-cleanup
```
Manually triggers cleanup of old records.

### Get Scheduler Status
```
GET /api/cart-abandonment/scheduler-status
```
Returns the status of all scheduled jobs.

### Stop Schedulers
```
POST /api/cart-abandonment/stop-scheduler/:name
POST /api/cart-abandonment/stop-all-schedulers
```
Stop specific or all schedulers.

## Email Templates

The email templates are professional and include:

- **Responsive Design**: Works on desktop and mobile devices
- **Product Images**: Shows actual product images from the cart
- **Pricing Information**: Displays individual and total prices
- **Call-to-Action**: Prominent buttons to complete purchase
- **Store Branding**: Customizable store name and colors
- **Benefits Section**: Highlights store benefits and guarantees
- **Unsubscribe Links**: Compliant unsubscribe functionality

## Customization

### Email Timing
To change email timing, update the intervals in `backend/services/cartAbandonmentService.js`:

```javascript
this.emailIntervals = {
  first_reminder: 24 * 60 * 60 * 1000, // 24 hours
  second_reminder: 72 * 60 * 60 * 1000, // 72 hours (3 days)
  final_reminder: 168 * 60 * 60 * 1000  // 168 hours (7 days)
};
```

### Email Content
Customize email content in `backend/services/emailService.js`:
- Update subject lines
- Modify email templates
- Change store branding
- Add custom benefits

### Scheduler Frequency
Change how often the system checks for abandoned carts in `backend/services/schedulerService.js`:

```javascript
// Current: every 6 hours
const job = cron.schedule('0 */6 * * *', async () => {
  // Cart abandonment check
});
```

## Monitoring

### Logs
The system logs all cart abandonment activities:
- Cart updates
- Email sends
- Purchase completions
- Scheduler runs

### Statistics
Use the admin endpoints to monitor:
- Total abandoned carts
- Email delivery rates
- Recovery rates
- Scheduler health

## Troubleshooting

### Emails Not Sending
1. Check SMTP configuration
2. Verify email credentials
3. Check server logs for errors
4. Test email connection using the health check

### Scheduler Not Running
1. Check if schedulers are started
2. Verify cron expressions
3. Check server logs
4. Use admin endpoints to check status

### Database Issues
1. Ensure cart_abandonment table exists
2. Check foreign key constraints
3. Verify user permissions

## Security Considerations

- Email credentials are stored in environment variables
- Admin endpoints require authentication
- User data is properly sanitized
- Unsubscribe links are provided for compliance

## Performance

- Database queries are optimized
- Email sending is asynchronous
- Old records are automatically cleaned up
- Schedulers run efficiently without blocking the main application

This cart abandonment system will help recover lost sales by reminding customers about their abandoned carts with professional, engaging emails.

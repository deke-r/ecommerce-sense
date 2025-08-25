# E-Commerce Full Stack Application

A complete e-commerce solution built with React.js frontend and Express.js backend.

## Tech Stack

- **Frontend**: React.js with Bootstrap
- **Backend**: Express.js with Node.js
- **Database**: MySQL
- **Authentication**: JWT

## Project Structure

\`\`\`
ecommerce-fullstack/
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── routes/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   └── package.json
└── database/
    └── schema.sql
\`\`\`

## Setup Instructions

### Database Setup
1. Install MySQL
2. Run the SQL schema: `mysql -u root -p < database/schema.sql`

### Backend Setup
1. Navigate to backend folder: `cd backend`
2. Install dependencies: `npm install`
3. Configure `.env` file with your database credentials
4. Start server: `npm run dev`

### Frontend Setup
1. Navigate to frontend folder: `cd frontend`
2. Install dependencies: `npm install`
3. Start application: `npm start`

## Features

### Customer Features
- Product browsing and search
- Shopping cart management
- Order placement and tracking
- User authentication
- Profile management

### Admin Features
- Product management (CRUD)
- Order management
- User management
- Dashboard analytics

## API Endpoints

### Authentication
- POST `/api/auth/signup` - User registration
- POST `/api/auth/login` - User login
- POST `/api/auth/forgot-password` - Password reset request
- POST `/api/auth/verify-otp` - OTP verification
- POST `/api/auth/reset-password` - Password reset

### Products
- GET `/api/products` - Get all products
- GET `/api/products/:id` - Get product details
- POST `/api/products` - Add product (Admin)
- PUT `/api/products/:id` - Update product (Admin)
- DELETE `/api/products/:id` - Delete product (Admin)

### Cart
- GET `/api/cart` - Get cart items
- POST `/api/cart` - Add to cart
- PUT `/api/cart/:id` - Update cart item
- DELETE `/api/cart/:id` - Remove from cart

### Orders
- POST `/api/orders` - Place order
- GET `/api/orders` - Get user orders
- GET `/api/admin/orders` - Get all orders (Admin)
- PUT `/api/admin/orders/:id` - Update order status (Admin)

## Default Admin Credentials
- Email: admin@ecommerce.com
- Password: admin123

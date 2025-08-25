# E-Commerce Application Deployment Guide

## Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn package manager

## Local Development Setup

### 1. Database Setup

1. Install MySQL and create a database:
\`\`\`sql
CREATE DATABASE ecommerce_db;
\`\`\`

2. Run the schema and seed data:
\`\`\`bash
mysql -u root -p ecommerce_db < database/schema.sql
mysql -u root -p ecommerce_db < database/seed-data.sql
\`\`\`

### 2. Backend Setup

1. Navigate to backend directory:
\`\`\`bash
cd backend
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Create and configure \`.env\` file:
\`\`\`env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=ecommerce_db
JWT_SECRET=your_super_secret_jwt_key_here
PORT=5000
\`\`\`

4. Create uploads directory:
\`\`\`bash
mkdir uploads
\`\`\`

5. Start the backend server:
\`\`\`bash
npm run dev
\`\`\`

### 3. Frontend Setup

1. Navigate to frontend directory:
\`\`\`bash
cd frontend
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Create \`.env\` file (optional):
\`\`\`env
REACT_APP_API_URL=http://localhost:5000/api
\`\`\`

4. Start the frontend application:
\`\`\`bash
npm start
\`\`\`

## Production Deployment

### Backend Deployment (Node.js)

1. Set production environment variables
2. Use PM2 for process management:
\`\`\`bash
npm install -g pm2
pm2 start server.js --name "ecommerce-api"
\`\`\`

3. Configure reverse proxy (Nginx):
\`\`\`nginx
server {
    listen 80;
    server_name your-api-domain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
\`\`\`

### Frontend Deployment

1. Build the React application:
\`\`\`bash
npm run build
\`\`\`

2. Deploy to static hosting (Netlify, Vercel, or serve with Nginx)

### Database Deployment

1. Use managed MySQL service (AWS RDS, Google Cloud SQL, etc.)
2. Update connection strings in production environment
3. Run migrations and seed data on production database

## Default Admin Credentials

- Email: admin@ecommerce.com
- Password: admin123

**Important**: Change these credentials in production!

## API Documentation

### Authentication Endpoints
- POST /api/auth/signup - User registration
- POST /api/auth/login - User login
- POST /api/auth/forgot-password - Password reset request
- POST /api/auth/verify-otp - OTP verification
- POST /api/auth/reset-password - Password reset

### Product Endpoints
- GET /api/products - Get all products
- GET /api/products/:id - Get product by ID
- POST /api/products - Add product (Admin only)
- PUT /api/products/:id - Update product (Admin only)
- DELETE /api/products/:id - Delete product (Admin only)

### Cart Endpoints
- GET /api/cart - Get cart items
- POST /api/cart - Add to cart
- PUT /api/cart/:id - Update cart item
- DELETE /api/cart/:id - Remove from cart

### Order Endpoints
- POST /api/orders - Place order
- GET /api/orders - Get user orders
- GET /api/admin/orders - Get all orders (Admin)
- PUT /api/admin/orders/:id - Update order status (Admin)

## Security Considerations

1. Change default admin credentials
2. Use strong JWT secrets
3. Enable HTTPS in production
4. Implement rate limiting
5. Validate and sanitize all inputs
6. Use environment variables for sensitive data
7. Regular security updates

## Monitoring and Maintenance

1. Set up logging (Winston, Morgan)
2. Monitor API performance
3. Regular database backups
4. Monitor disk space for uploads
5. Set up error tracking (Sentry)

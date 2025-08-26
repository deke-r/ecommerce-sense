# Categories Setup Guide

This guide explains how to set up the new categories functionality in the ecommerce application.

## Database Setup

### 1. Run the Migration Script

Execute the migration script to create the categories table and update the products table:

```sql
mysql -u your_username -p ecommerce_db < database/migration.sql
```

Or run the SQL commands directly in your MySQL client:

```sql
USE ecommerce_db;

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add category_id column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id INT;
ALTER TABLE products ADD CONSTRAINT IF NOT EXISTS fk_product_category 
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;
```

### 2. Insert Sample Categories

```sql
INSERT INTO categories (name, description, is_active) VALUES 
('Electronics', 'Electronic devices and gadgets', 1),
('Computers', 'Computers, laptops, and accessories', 1),
('Mobile Devices', 'Smartphones, tablets, and mobile accessories', 1),
('Audio', 'Headphones, speakers, and audio equipment', 1),
('Photography', 'Cameras, lenses, and photography gear', 1),
('Gaming', 'Gaming consoles, games, and accessories', 1),
('Fitness', 'Fitness trackers and health monitoring devices', 1),
('Accessories', 'Various tech accessories and peripherals', 1);
```

## Features

### Admin Categories Management

- **View Categories**: See all categories in a table format
- **Add Categories**: Create new categories with name, description, and active status
- **Edit Categories**: Modify existing category details
- **Delete Categories**: Remove categories (only if not used by products)
- **Toggle Status**: Activate/deactivate categories

### Category Fields

- **ID**: Auto-incrementing unique identifier
- **Name**: Category name (required, unique)
- **Description**: Optional description text
- **Active Status**: Boolean flag for visibility
- **Created/Updated**: Timestamps for tracking

## API Endpoints

### GET /api/admin/categories
- **Description**: Get all categories
- **Access**: Admin only
- **Response**: List of categories with all fields

### POST /api/admin/categories
- **Description**: Create new category
- **Access**: Admin only
- **Body**: `{ name, description, is_active }`
- **Response**: Created category details

### PUT /api/admin/categories/:id
- **Description**: Update existing category
- **Access**: Admin only
- **Body**: `{ name, description, is_active }`
- **Response**: Success message

### DELETE /api/admin/categories/:id
- **Description**: Delete category
- **Access**: Admin only
- **Response**: Success message (only if category not used by products)

## Frontend Components

### AdminCategories.js
- Main categories management page
- Table view of all categories
- Add/Edit modal forms
- Status toggle functionality
- Delete confirmation

### AdminSidebar.js
- Added "Categories" navigation item
- Uses Bootstrap Icons (bi-tags)

## Usage

1. **Access**: Navigate to `/admin/categories` (admin login required)
2. **Add Category**: Click "Add Category" button
3. **Edit Category**: Click edit icon on any category row
4. **Toggle Status**: Click on the status badge to toggle active/inactive
5. **Delete Category**: Click delete icon (only available if category has no products)

## Security

- All category operations require admin authentication
- Category names must be unique
- Categories cannot be deleted if they have associated products
- Input validation and sanitization implemented

## Future Enhancements

- Category image uploads
- Category hierarchy (parent-child relationships)
- Category-based product filtering
- Category analytics and reporting
- Bulk category operations 
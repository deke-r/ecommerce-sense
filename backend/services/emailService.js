const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendCartAbandonmentEmail(userEmail, userName, cartItems, emailType = 'first_reminder') {
    try {
      const subject = this.getEmailSubject(emailType);
      const htmlContent = this.generateCartAbandonmentHTML(userName, cartItems, emailType);
      
      const mailOptions = {
        from: `"${process.env.STORE_NAME || 'E-commerce Store'}" <${process.env.SMTP_USER}>`,
        to: userEmail,
        subject: subject,
        html: htmlContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`Cart abandonment email sent to ${userEmail}:`, result.messageId);
      return result;
    } catch (error) {
      console.error('Error sending cart abandonment email:', error);
      throw error;
    }
  }

  getEmailSubject(emailType) {
    const subjects = {
      'first_reminder': '🛒 Don\'t forget your items! Complete your purchase now',
      'second_reminder': '⏰ Last chance! Your cart items are waiting for you',
      'final_reminder': '🔥 Final reminder - Your cart expires soon!'
    };
    return subjects[emailType] || subjects['first_reminder'];
  }

  generateCartAbandonmentHTML(userName, cartItems, emailType) {
    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const storeName = process.env.STORE_NAME || 'E-commerce Store';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    const urgencyMessage = this.getUrgencyMessage(emailType);
    const ctaText = this.getCTAText(emailType);

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Complete Your Purchase</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f8f9fa;
            }
            .container {
                background: white;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px 20px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 600;
            }
            .content {
                padding: 30px 20px;
            }
            .greeting {
                font-size: 18px;
                margin-bottom: 20px;
                color: #2c3e50;
            }
            .urgency-message {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 8px;
                padding: 15px;
                margin: 20px 0;
                text-align: center;
                font-weight: 500;
                color: #856404;
            }
            .cart-items {
                margin: 25px 0;
            }
            .cart-item {
                display: flex;
                align-items: center;
                padding: 15px 0;
                border-bottom: 1px solid #eee;
            }
            .cart-item:last-child {
                border-bottom: none;
            }
            .item-image {
                width: 80px;
                height: 80px;
                object-fit: cover;
                border-radius: 8px;
                margin-right: 15px;
            }
            .item-details {
                flex: 1;
            }
            .item-title {
                font-weight: 600;
                font-size: 16px;
                margin-bottom: 5px;
                color: #2c3e50;
            }
            .item-price {
                color: #e74c3c;
                font-weight: 600;
                font-size: 18px;
            }
            .item-quantity {
                color: #7f8c8d;
                font-size: 14px;
            }
            .total-section {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin: 25px 0;
                text-align: center;
            }
            .total-amount {
                font-size: 24px;
                font-weight: 700;
                color: #2c3e50;
                margin: 10px 0;
            }
            .cta-button {
                display: inline-block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 50px;
                font-weight: 600;
                font-size: 16px;
                margin: 20px 0;
                transition: transform 0.2s;
            }
            .cta-button:hover {
                transform: translateY(-2px);
            }
            .benefits {
                background: #e8f5e8;
                padding: 20px;
                border-radius: 8px;
                margin: 25px 0;
            }
            .benefits h3 {
                margin-top: 0;
                color: #27ae60;
            }
            .benefits ul {
                margin: 0;
                padding-left: 20px;
            }
            .benefits li {
                margin: 8px 0;
                color: #2c3e50;
            }
            .footer {
                background: #2c3e50;
                color: white;
                padding: 20px;
                text-align: center;
                font-size: 14px;
            }
            .footer a {
                color: #3498db;
                text-decoration: none;
            }
            .social-links {
                margin: 15px 0;
            }
            .social-links a {
                display: inline-block;
                margin: 0 10px;
                color: #3498db;
                text-decoration: none;
            }
            @media (max-width: 600px) {
                .cart-item {
                    flex-direction: column;
                    text-align: center;
                }
                .item-image {
                    margin: 0 0 10px 0;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>${storeName}</h1>
            </div>
            
            <div class="content">
                <div class="greeting">
                    Hi ${userName}! 👋
                </div>
                
                <p>We noticed you added some amazing items to your cart but haven't completed your purchase yet.</p>
                
                <div class="urgency-message">
                    ${urgencyMessage}
                </div>
                
                <div class="cart-items">
                    <h3>Your Cart Items:</h3>
                    ${cartItems.map(item => `
                        <div class="cart-item">
                            <img src="${item.image}" alt="${item.title}" class="item-image" onerror="this.src='https://via.placeholder.com/80x80?text=No+Image'">
                            <div class="item-details">
                                <div class="item-title">${item.title}</div>
                                <div class="item-quantity">Quantity: ${item.quantity}</div>
                                <div class="item-price">$${item.price.toFixed(2)} each</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="total-section">
                    <div>Total Amount:</div>
                    <div class="total-amount">$${totalAmount.toFixed(2)}</div>
                </div>
                
                <div style="text-align: center;">
                    <a href="${frontendUrl}/cart" class="cta-button">
                        ${ctaText}
                    </a>
                </div>
                
                <div class="benefits">
                    <h3>Why complete your purchase now?</h3>
                    <ul>
                        <li>✅ Secure checkout with multiple payment options</li>
                        <li>🚚 Fast and reliable shipping</li>
                        <li>🔒 30-day money-back guarantee</li>
                        <li>📞 24/7 customer support</li>
                        <li>🎁 Exclusive discounts for returning customers</li>
                    </ul>
                </div>
                
                <p style="text-align: center; color: #7f8c8d; font-size: 14px;">
                    Questions? Contact us at <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@example.com'}">${process.env.SUPPORT_EMAIL || 'support@example.com'}</a>
                </p>
            </div>
            
            <div class="footer">
                <div class="social-links">
                    <a href="#">Facebook</a>
                    <a href="#">Twitter</a>
                    <a href="#">Instagram</a>
                </div>
                <p>&copy; 2024 ${storeName}. All rights reserved.</p>
                <p>
                    <a href="${frontendUrl}/unsubscribe?email=${encodeURIComponent(userEmail)}">Unsubscribe</a> | 
                    <a href="${frontendUrl}/privacy">Privacy Policy</a>
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  getUrgencyMessage(emailType) {
    const messages = {
      'first_reminder': '⏰ Your items are still waiting for you! Complete your purchase to secure these products.',
      'second_reminder': '🔥 Limited time offer! Your cart items are in high demand. Don\'t miss out!',
      'final_reminder': '🚨 Final call! Your cart will expire soon. Complete your purchase now or risk losing these items.'
    };
    return messages[emailType] || messages['first_reminder'];
  }

  getCTAText(emailType) {
    const texts = {
      'first_reminder': 'Complete Purchase Now',
      'second_reminder': 'Secure Your Items',
      'final_reminder': 'Buy Now - Last Chance!'
    };
    return texts[emailType] || texts['first_reminder'];
  }

  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('Email service connection verified successfully');
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      return false;
    }
  }
}

module.exports = new EmailService();

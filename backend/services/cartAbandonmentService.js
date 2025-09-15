const { getConnection } = require('../config/database');
const emailService = require('./emailService');

class CartAbandonmentService {
  constructor() {
    this.emailIntervals = {
      first_reminder: 24 * 60 * 60 * 1000, // 24 hours
      second_reminder: 72 * 60 * 60 * 1000, // 72 hours (3 days)
      final_reminder: 168 * 60 * 60 * 1000  // 168 hours (7 days)
    };
  }

  async trackCartUpdate(userId, cartItems) {
    try {
      const con = getConnection();
      
      // Check if user has existing cart abandonment record
      const [existing] = await con.execute(
        'SELECT id FROM cart_abandonment WHERE user_id = ? AND is_purchased = 0',
        [userId]
      );

      const cartData = JSON.stringify(cartItems);
      const now = new Date();

      if (existing.length > 0) {
        // Update existing record
        await con.execute(
          'UPDATE cart_abandonment SET cart_data = ?, last_updated = ?, email_sent_at = NULL, email_type = NULL WHERE id = ?',
          [cartData, now, existing[0].id]
        );
      } else {
        // Create new record
        await con.execute(
          'INSERT INTO cart_abandonment (user_id, cart_data, last_updated) VALUES (?, ?, ?)',
          [userId, cartData, now]
        );
      }

      console.log(`Cart abandonment tracking updated for user ${userId}`);
    } catch (error) {
      console.error('Error tracking cart update:', error);
    }
  }

  async markAsPurchased(userId) {
    try {
      const con = getConnection();
      await con.execute(
        'UPDATE cart_abandonment SET is_purchased = 1 WHERE user_id = ? AND is_purchased = 0',
        [userId]
      );
      console.log(`Cart marked as purchased for user ${userId}`);
    } catch (error) {
      console.error('Error marking cart as purchased:', error);
    }
  }

  async processAbandonedCarts() {
    try {
      const con = getConnection();
      const now = new Date();

      // Get all abandoned carts that need email reminders
      const [abandonedCarts] = await con.execute(`
        SELECT 
          ca.id,
          ca.user_id,
          ca.cart_data,
          ca.last_updated,
          ca.email_sent_at,
          ca.email_type,
          u.name,
          u.email
        FROM cart_abandonment ca
        JOIN users u ON ca.user_id = u.id
        WHERE ca.is_purchased = 0
        AND u.status = 'active'
        AND (
          (ca.email_sent_at IS NULL AND ca.last_updated <= ?) OR
          (ca.email_type = 'first_reminder' AND ca.email_sent_at <= ?) OR
          (ca.email_type = 'second_reminder' AND ca.email_sent_at <= ?)
        )
      `, [
        new Date(now.getTime() - this.emailIntervals.first_reminder),
        new Date(now.getTime() - this.emailIntervals.second_reminder),
        new Date(now.getTime() - this.emailIntervals.final_reminder)
      ]);

      console.log(`Found ${abandonedCarts.length} abandoned carts to process`);

      for (const cart of abandonedCarts) {
        await this.sendAbandonmentEmail(cart);
      }

      return abandonedCarts.length;
    } catch (error) {
      console.error('Error processing abandoned carts:', error);
      throw error;
    }
  }

  async sendAbandonmentEmail(cartRecord) {
    try {
      const con = getConnection();
      const cartItems = JSON.parse(cartRecord.cart_data);
      const now = new Date();
      
      // Determine which email type to send
      let emailType = 'first_reminder';
      
      if (cartRecord.email_type === 'first_reminder') {
        emailType = 'second_reminder';
      } else if (cartRecord.email_type === 'second_reminder') {
        emailType = 'final_reminder';
      }

      // Send the email
      await emailService.sendCartAbandonmentEmail(
        cartRecord.email,
        cartRecord.name,
        cartItems,
        emailType
      );

      // Update the record
      await con.execute(
        'UPDATE cart_abandonment SET email_sent_at = ?, email_type = ? WHERE id = ?',
        [now, emailType, cartRecord.id]
      );

      console.log(`Sent ${emailType} email to ${cartRecord.email}`);
    } catch (error) {
      console.error(`Error sending abandonment email to ${cartRecord.email}:`, error);
    }
  }

  async getAbandonmentStats() {
    try {
      const con = getConnection();
      
      const [stats] = await con.execute(`
        SELECT 
          COUNT(*) as total_abandoned,
          COUNT(CASE WHEN email_sent_at IS NOT NULL THEN 1 END) as emails_sent,
          COUNT(CASE WHEN is_purchased = 1 THEN 1 END) as recovered,
          COUNT(CASE WHEN email_type = 'first_reminder' THEN 1 END) as first_reminders,
          COUNT(CASE WHEN email_type = 'second_reminder' THEN 1 END) as second_reminders,
          COUNT(CASE WHEN email_type = 'final_reminder' THEN 1 END) as final_reminders
        FROM cart_abandonment
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      `);

      return stats[0];
    } catch (error) {
      console.error('Error getting abandonment stats:', error);
      throw error;
    }
  }

  async cleanupOldRecords() {
    try {
      const con = getConnection();
      // Delete records older than 30 days that are either purchased or have received final reminder
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      const [result] = await con.execute(
        'DELETE FROM cart_abandonment WHERE (is_purchased = 1 OR email_type = "final_reminder") AND created_at < ?',
        [thirtyDaysAgo]
      );

      console.log(`Cleaned up ${result.affectedRows} old cart abandonment records`);
      return result.affectedRows;
    } catch (error) {
      console.error('Error cleaning up old records:', error);
      throw error;
    }
  }
}

module.exports = new CartAbandonmentService();

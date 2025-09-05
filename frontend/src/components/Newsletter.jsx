import React, { useState } from 'react';
import { newsletterAPI } from '../services/api';
import styles from '../style/Newsletter.module.css';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await newsletterAPI.subscribe(email);
      setMessage('Successfully subscribed to newsletter!');
      setEmail('');
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setMessage('Error subscribing to newsletter. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.newsletterContainer}>
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6">
            <h3 className={styles.title}>Stay Updated</h3>
            <p className={styles.subtitle}>
              Subscribe to our newsletter for the latest products, deals, and updates.
            </p>
          </div>
          <div className="col-lg-6">
            <form onSubmit={handleSubmit} className={styles.newsletterForm}>
              <div className={styles.inputGroup}>
                <input
                  type="email"
                  className={styles.emailInput}
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className={styles.subscribeBtn}
                  disabled={loading}
                >
                  {loading ? 'Subscribing...' : 'Subscribe'}
                </button>
              </div>
              {message && (
                <div className={`${styles.message} ${message.includes('Successfully') ? styles.success : styles.error}`}>
                  {message}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Newsletter;

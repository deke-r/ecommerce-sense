import React, { useState } from 'react';
import { newsletterAPI } from '../services/api';
import styles from '../style/NewsletterSignup.module.css';

const NewsletterSignup = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      setMessage('');
      await newsletterAPI.subscribe(email);
      setMessage('Successfully subscribed to newsletter!');
      setIsSuccess(true);
      setEmail('');
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setMessage('Failed to subscribe. Please try again.');
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.newsletterSection}>
      <div className="row justify-content-center">
        <div className="col-md-8 text-center">
          <h3 className={styles.newsletterTitle}>Stay Updated</h3>
          <p className={styles.newsletterSubtitle}>
            Get the latest deals and new arrivals delivered to your inbox
          </p>
          
          <form onSubmit={handleSubmit} className={styles.newsletterForm}>
            <div className="input-group mb-3">
              <input
                type="email"
                className="form-control"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
              <button 
                className="btn btn-light" 
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                ) : (
                  <i className="bi bi-envelope me-2"></i>
                )}
                Subscribe
              </button>
            </div>
          </form>

          {message && (
            <div className={`alert ${isSuccess ? 'alert-success' : 'alert-danger'}`} role="alert">
              {message}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default NewsletterSignup;

import React, { useState } from 'react';
import styles from '../style/Contact.module.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        alert('Error sending message. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error sending message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className={styles.successMessage}>
              <i className="fas fa-check-circle"></i>
              <h3>Message Sent Successfully!</h3>
              <p>Thank you for contacting us. We'll get back to you soon.</p>
              <button 
                className="btn btn-primary"
                onClick={() => setSubmitted(false)}
              >
                Send Another Message
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <div className="row">
        <div className="col-lg-8">
          <h2 className={styles.pageTitle}>Contact Us</h2>
          <p className={styles.pageSubtitle}>
            Have a question or need help? We'd love to hear from you.
          </p>

          <form onSubmit={handleSubmit} className={styles.contactForm}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="name" className={styles.formLabel}>Name *</label>
                <input
                  type="text"
                  className={styles.formInput}
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="email" className={styles.formLabel}>Email *</label>
                <input
                  type="email"
                  className={styles.formInput}
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="subject" className={styles.formLabel}>Subject *</label>
              <input
                type="text"
                className={styles.formInput}
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="message" className={styles.formLabel}>Message *</label>
              <textarea
                className={styles.formTextarea}
                id="message"
                name="message"
                rows="5"
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className={`btn btn-primary ${styles.submitBtn}`}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>

        <div className="col-lg-4">
          <div className={styles.contactInfo}>
            <h4>Get in Touch</h4>
            <div className={styles.infoItem}>
              <i className="fas fa-phone"></i>
              <div>
                <strong>Phone</strong>
                <p>+1 (555) 123-4567</p>
              </div>
            </div>
            <div className={styles.infoItem}>
              <i className="fas fa-envelope"></i>
              <div>
                <strong>Email</strong>
                <p>support@ecommerce.com</p>
              </div>
            </div>
            <div className={styles.infoItem}>
              <i className="fas fa-map-marker-alt"></i>
              <div>
                <strong>Address</strong>
                <p>123 Commerce Street<br />Business City, BC 12345</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;

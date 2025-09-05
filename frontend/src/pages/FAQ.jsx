import React, { useState, useEffect } from 'react';
import styles from '../style/FAQ.module.css';

const FAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState(new Set());

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/faq`);
      const data = await response.json();
      setFaqs(data.faqs);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (id) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <div className="row">
        <div className="col-12">
          <h2 className={styles.pageTitle}>Frequently Asked Questions</h2>
          <p className={styles.pageSubtitle}>
            Find answers to common questions about our products and services.
          </p>

          <div className={styles.searchContainer}>
            <div className={styles.searchBox}>
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>

          <div className={styles.faqContainer}>
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((faq) => (
                <div key={faq.id} className={styles.faqItem}>
                  <button
                    className={styles.faqQuestion}
                    onClick={() => toggleExpanded(faq.id)}
                  >
                    <span>{faq.question}</span>
                    <i className={`fas fa-chevron-down ${expandedItems.has(faq.id) ? styles.rotated : ''}`}></i>
                  </button>
                  {expandedItems.has(faq.id) && (
                    <div className={styles.faqAnswer}>
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className={styles.noResults}>
                <i className="fas fa-search"></i>
                <h4>No FAQs found</h4>
                <p>Try searching with different keywords</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;

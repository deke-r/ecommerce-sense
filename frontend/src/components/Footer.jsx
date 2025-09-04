import styles from "../style/footer.module.css"

export default function Footer() {
  return (
    <footer className={styles.footer} aria-labelledby="site-footer-heading">
      <h2 id="site-footer-heading" className="sr-only">
        Site footer
      </h2>

      <div className={styles.wrap}>
        <div className={styles.topGrid}>
          <div>
            <h3 className={styles.colTitle}>ABOUT</h3>
            <a className={styles.link} href="/helpcentre?otracker=footer_navlinks" aria-label="Contact Us">
              Contact Us
            </a>
            <a className={styles.link} href="https://corporate.flipkart.net/corporate-home" aria-label="About Us">
              About Us
            </a>
            <a
              className={styles.link}
              href="https://www.flipkartcareers.com/?otracker=footer_navlinks"
              aria-label="Careers"
              target="_blank"
              rel="noopener noreferrer"
            >
              Careers
            </a>
            <a
              className={styles.link}
              href="http://stories.flipkart.com/?otracker=footer_navlinks"
              aria-label="Flipkart Stories"
              target="_blank"
              rel="noopener noreferrer"
            >
              Flipkart Stories
            </a>
            <a
              className={styles.link}
              href="http://stories.flipkart.com/category/top-stories/news/"
              aria-label="Press"
              target="_blank"
              rel="noopener noreferrer"
            >
              Press
            </a>
            <a className={styles.link} href="/corporate-information" aria-label="Corporate Information">
              Corporate Information
            </a>
          </div>

          <div>
            <h3 className={styles.colTitle}>GROUP COMPANIES</h3>
            <a
              className={styles.link}
              href="https://www.myntra.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Myntra"
            >
              Myntra
            </a>
            <a
              className={styles.link}
              href="https://www.cleartrip.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Cleartrip"
            >
              Cleartrip
            </a>
            <a
              className={styles.link}
              href="https://www.shopsy.in"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Shopsy"
            >
              Shopsy
            </a>
          </div>

          <div>
            <h3 className={styles.colTitle}>HELP</h3>
            <a className={styles.link} href="/pages/payments" aria-label="Payments">
              Payments
            </a>
            <a className={styles.link} href="/pages/shipping" aria-label="Shipping">
              Shipping
            </a>
            <a
              className={styles.link}
              href="/helpcentre?catalog=55c9c6edb000002e002c1701&view=CATALOG"
              aria-label="Cancellation & Returns"
            >
              Cancellation &amp; Returns
            </a>
            <a
              className={styles.link}
              href="/helpcentre?catalog=55c9c8e2b0000023002c1702&view=CATALOG"
              aria-label="FAQ"
            >
              FAQ
            </a>
          </div>

          <div>
            <h3 className={styles.colTitle}>CONSUMER POLICY</h3>
            <a
              className={styles.link}
              href="/pages/returnpolicy?otracker=footer_navlinks"
              aria-label="Cancellation & Returns"
            >
              Cancellation &amp; Returns
            </a>
            <a className={styles.link} href="/pages/terms?otracker=footer_navlinks" aria-label="Terms Of Use">
              Terms Of Use
            </a>
            <a className={styles.link} href="/pages/paymentsecurity?otracker=footer_navlinks" aria-label="Security">
              Security
            </a>
            <a className={styles.link} href="/pages/privacypolicy?otracker=footer_navlinks" aria-label="Privacy">
              Privacy
            </a>
            <a className={styles.link} href="/sitemap?otracker=footer_navlinks" aria-label="Sitemap">
              Sitemap
            </a>
            <a
              className={styles.link}
              href="/pages/grievance-redressal-mechanism?otracker=footer_navlinks"
              aria-label="Grievance Redressal"
            >
              Grievance Redressal
            </a>
            <a
              className={styles.link}
              href="/pages/ewaste-compliance-tnc?otracker=footer_navlinks"
              aria-label="EPR Compliance"
            >
              EPR Compliance
            </a>
          </div>

          <div>
            <h3 className={`${styles.colTitle} ${styles.socialTitle}`}>Social:</h3>
            <div className={styles.socialRow} role="list" aria-label="Social links">
              <a
                className={styles.socialIcon}
                href="https://www.facebook.com/flipkart"
                aria-label="Facebook"
                target="_blank"
                rel="noopener noreferrer"
              >
                {/* Facebook */}
                <svg width="20" height="20" viewBox="0 0 25 24" fill="none" aria-hidden="true">
                  <path
                    d="M12.9331 21C17.9037 21 21.9331 16.9706 21.9331 12C21.9331 7.02944 17.9037 3 12.9331 3C7.96254 3 3.93311 7.02944 3.93311 12C3.93311 16.9706 7.96254 21 12.9331 21Z"
                    stroke="white"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M16.6831 8.25H15.1831C14.5864 8.25 14.0141 8.48705 13.5921 8.90901C13.1702 9.33097 12.9331 9.90326 12.9331 10.5V21"
                    stroke="white"
                    strokeWidth="1.5"
                  />
                  <path d="M9.93311 13.5H15.9331" stroke="white" strokeWidth="1.5" />
                </svg>
              </a>
              <a
                className={styles.socialIcon}
                href="https://www.twitter.com/flipkart"
                aria-label="Twitter"
                target="_blank"
                rel="noopener noreferrer"
              >
                {/* Twitter/X */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M11.42 13.09L10.72 12.09L5.18 4.17H7.56L12.03 10.56L12.73 11.56L18.54 19.87H16.16L11.42 13.09Z"
                    fill="white"
                  />
                  <path d="M13.54 10.62L20.1 3H18.54L12.85 9.61L13.54 10.62Z" fill="white" />
                  <path d="M10.63 13.09V13.09L4.06 21H6.45L11.2 14.01L10.63 13.09Z" fill="white" />
                </svg>
              </a>
              <a
                className={styles.socialIcon}
                href="https://www.youtube.com/flipkart"
                aria-label="YouTube"
                target="_blank"
                rel="noopener noreferrer"
              >
                {/* YouTube */}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="2" y="6" width="20" height="12" rx="3" stroke="white" strokeWidth="1.5" />
                  <path d="M10 9L16 12L10 15V9Z" fill="white" />
                </svg>
              </a>
              <a
                className={styles.socialIcon}
                href="https://www.instagram.com/flipkart"
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                {/* Instagram */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="4" y="4" width="16" height="16" rx="4" stroke="white" strokeWidth="1.5" />
                  <circle cx="12" cy="12" r="3.5" stroke="white" strokeWidth="1.5" />
                  <circle cx="17" cy="7" r="1" fill="white" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h3 className={styles.colTitle}>Registered Office Address:</h3>
            <address className={styles.address}>
              <p>Flipkart Internet Private Limited,</p>
              <p>Buildings Alyssa, Begonia &amp;</p>
              <p>Clove Embassy Tech Village,</p>
              <p>Outer Ring Road, Devarabeesanahalli Village,</p>
              <p>Bengaluru, 560103,</p>
              <p>Karnataka, India</p>
              <p>CIN : U51109KA2012PTC066107</p>
              <p>
                Telephone: <a href="tel:044-45614700">044-45614700</a> / <a href="tel:044-67415800">044-67415800</a>
              </p>
            </address>
          </div>
        </div>

        <div className={styles.bottomBar}>
          <div className={styles.bottomItems}>
            <a
              className={styles.bottomLink}
              href="https://seller.flipkart.com/?utm_source=fkwebsite&utm_medium=websitedirect"
              aria-label="Become a Seller"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className={styles.bottomIcon} aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M3 7h18l-2 4H5L3 7Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                  <path d="M6 11v6a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-6" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </span>
              <span>Become a Seller</span>
            </a>
            <a
              className={styles.bottomLink}
              href="https://brands.flipkart.com"
              aria-label="Advertise"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className={styles.bottomIcon} aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M3 10h9l6-3v10l-6-3H3v-4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                  <path d="M7 20v-6" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </span>
              <span>Advertise</span>
            </a>
            <a
              className={styles.bottomLink}
              href="/the-gift-card-store?otracker=footer_navlinks"
              aria-label="Gift Cards"
            >
              <span className={styles.bottomIcon} aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="8" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M3 12h18" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M12 8v12" stroke="currentColor" strokeWidth="1.6" />
                  <path
                    d="M9 8c-1.657 0-3-1.12-3-2.5S7.343 3 9 4.2C9.8 4.8 10.5 6 12 6"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                  <path
                    d="M15 8c1.657 0 3-1.12 3-2.5S16.657 3 15 4.2C14.2 4.8 13.5 6 12 6"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                </svg>
              </span>
              <span>Gift Cards</span>
            </a>
            <a className={styles.bottomLink} href="/helpcentre?otracker=footer_navlinks" aria-label="Help Center">
              <span className={styles.bottomIcon} aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
                  <path
                    d="M9.5 9a2.5 2.5 0 1 1 4.33 1.66c-.64.64-1.33 1-1.33 2.34"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                  <circle cx="12" cy="17" r="1" fill="currentColor" />
                </svg>
              </span>
              <span>Help Center</span>
            </a>
          </div>

          <span className={styles.copy}>
            &copy; 2007-2025 <span>Flipkart.com</span>
          </span>

          <img className={styles.payments} src="/images/payment-methods.svg" alt="Payment methods supported" />
        </div>
      </div>
    </footer>
  )
}

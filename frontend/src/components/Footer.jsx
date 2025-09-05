import { Link } from "react-router-dom"
import styles from "../style/footer.module.css"

export default function Footer() {
  return (
    <footer className={`${styles.footer} bg-dark text-light py-5`}>
      <div className="container">
        <div className="row">
          {/* About Section */}
          <div className="col-lg-2 col-md-3 col-sm-6 mb-4">
            <h6 className={styles.footerHeading}>ABOUT</h6>
            <ul className={styles.footerLinks}>
              <li>
                <Link to="/contact" className={styles.footerLink}>
                  Contact Us
                </Link>
              </li>
              <li>
                <a href="/about" className={styles.footerLink}>
                  About Us
                </a>
              </li>
              <li>
                <a href="/careers" className={styles.footerLink}>
                  Careers
                </a>
              </li>
              <li>
                <a href="/stories" className={styles.footerLink}>
                  Company Stories
                </a>
              </li>
              <li>
                <a href="/press" className={styles.footerLink}>
                  Press
                </a>
              </li>
              <li>
                <a href="/corporate" className={styles.footerLink}>
                  Corporate Information
                </a>
              </li>
            </ul>
          </div>

          {/* Group Companies */}
          <div className="col-lg-2 col-md-3 col-sm-6 mb-4">
            <h6 className={styles.footerHeading}>GROUP COMPANIES</h6>
            <ul className={styles.footerLinks}>
              <li>
                <a
                  href="https://www.myntra.com/"
                  className={styles.footerLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Myntra
                </a>
              </li>
              <li>
                <a
                  href="https://www.cleartrip.com/"
                  className={styles.footerLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Cleartrip
                </a>
              </li>
              <li>
                <a href="https://www.shopsy.in" className={styles.footerLink} target="_blank" rel="noopener noreferrer">
                  Shopsy
                </a>
              </li>
            </ul>
          </div>

          {/* Help Section */}
          <div className="col-lg-2 col-md-3 col-sm-6 mb-4">
            <h6 className={styles.footerHeading}>HELP</h6>
            <ul className={styles.footerLinks}>
              <li>
                <a href="/payments" className={styles.footerLink}>
                  Payments
                </a>
              </li>
              <li>
                <a href="/shipping" className={styles.footerLink}>
                  Shipping
                </a>
              </li>
              <li>
                <a href="/returns" className={styles.footerLink}>
                  Cancellation & Returns
                </a>
              </li>
              <li>
                <Link to="/faq" className={styles.footerLink}>
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact" className={styles.footerLink}>
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Consumer Policy */}
          <div className="col-lg-2 col-md-3 col-sm-6 mb-4">
            <h6 className={styles.footerHeading}>CONSUMER POLICY</h6>
            <ul className={styles.footerLinks}>
              <li>
                <a href="/return-policy" className={styles.footerLink}>
                  Cancellation & Returns
                </a>
              </li>
              <li>
                <a href="/terms" className={styles.footerLink}>
                  Terms Of Use
                </a>
              </li>
              <li>
                <a href="/security" className={styles.footerLink}>
                  Security
                </a>
              </li>
              <li>
                <a href="/privacy" className={styles.footerLink}>
                  Privacy
                </a>
              </li>
              <li>
                <a href="/sitemap" className={styles.footerLink}>
                  Sitemap
                </a>
              </li>
              <li>
                <a href="/grievance" className={styles.footerLink}>
                  Grievance Redressal
                </a>
              </li>
              <li>
                <a href="/epr-compliance" className={styles.footerLink}>
                  EPR Compliance
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-lg-4 col-md-6 mb-4">
            <div className={styles.contactSection}>
              <h6 className={styles.footerHeading}>Mail Us:</h6>
              <div className={styles.addressText}>
                <p>Company Internet Private Limited,</p>
                <p>Buildings Alyssa, Begonia &</p>
                <p>Clove Embassy Tech Village,</p>
                <p>Outer Ring Road, Devarabeesanahalli Village,</p>
                <p>Bengaluru, 560103,</p>
                <p>Karnataka, India</p>
              </div>

              <h6 className={`${styles.footerHeading} mt-4`}>Social:</h6>
              <div className={styles.socialIcons}>
                <a href="https://www.facebook.com/company" className={styles.socialIcon} aria-label="Facebook">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M15.75 8.25H14.25C13.6533 8.25 13.0808 8.48705 12.659 8.90901C12.2371 9.33097 12 9.90326 12 10.5V21"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9 13.5H15"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
                <a href="https://www.twitter.com/company" className={styles.socialIcon} aria-label="Twitter">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M13.5436 10.6179L20.0971 3H18.5441L12.8537 9.61448L8.30887 3H3.06689L9.93964 13.0023L3.06689 20.9908H4.61994L10.6291 14.0056L15.4288 20.9908H20.6708L13.5432 10.6179H13.5436ZM11.4165 13.0904L10.7202 12.0944L5.17953 4.16911H7.56491L12.0363 10.5651L12.7326 11.5611L18.5448 19.8748H16.1595L11.4165 13.0908V13.0904Z"
                      fill="white"
                    />
                  </svg>
                </a>
                <a href="https://www.youtube.com/company" className={styles.socialIcon} aria-label="YouTube">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M22.46 6C22.46 6 22.25 4.68 21.66 4.08C20.9 3.34 20.06 3.34 19.66 3.3C16.5 3 12 3 12 3C12 3 7.5 3 4.34 3.3C3.94 3.34 3.1 3.34 2.34 4.08C1.75 4.68 1.54 6 1.54 6C1.54 6 1.25 7.58 1.25 9.17V10.83C1.25 12.42 1.54 14 1.54 14C1.54 14 1.75 15.32 2.34 15.92C3.1 16.66 4.1 16.63 4.54 16.71C6.25 16.86 12 16.92 12 16.92C12 16.92 16.5 16.91 19.66 16.61C20.06 16.57 20.9 16.57 21.66 15.83C22.25 15.23 22.46 13.91 22.46 13.91C22.46 13.91 22.75 12.33 22.75 10.74V9.08C22.75 7.49 22.46 5.91 22.46 5.91V6Z"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9.75 13.5L15.5 10.5L9.75 7.5V13.5Z"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
                <a href="https://www.instagram.com/company" className={styles.socialIcon} aria-label="Instagram">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="white" strokeWidth="1.5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z" stroke="white" strokeWidth="1.5" />
                    <line
                      x1="17.5"
                      y1="6.5"
                      x2="17.51"
                      y2="6.5"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </a>
              </div>
            </div>

            <div className={`${styles.registeredOffice} mt-4`}>
              <h6 className={styles.footerHeading}>Registered Office Address:</h6>
              <div className={styles.addressText}>
                <p>Company Internet Private Limited,</p>
                <p>Buildings Alyssa, Begonia &</p>
                <p>Clove Embassy Tech Village,</p>
                <p>Outer Ring Road, Devarabeesanahalli Village,</p>
                <p>Bengaluru, 560103,</p>
                <p>Karnataka, India</p>
                <p>CIN : U51109KA2012PTC066107</p>
                <p>
                  Telephone:{" "}
                  <a href="tel:044-45614700" className={styles.phoneLink}>
                    044-45614700
                  </a>{" "}
                  /{" "}
                  <a href="tel:044-67415800" className={styles.phoneLink}>
                    044-67415800
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className={`${styles.bottomSection} border-top pt-4 mt-4`}>
          <div className="row align-items-center">
            <div className="col-md-8">
              <div className={styles.bottomLinks}>
                <div className={styles.bottomLinkItem}>
                  <svg width="13" height="12" viewBox="0 0 13 12" fill="none">
                    <path
                      d="M6.5 0L8.09 4.09L12.5 4.09L9.2 6.82L10.79 10.91L6.5 8.18L2.21 10.91L3.8 6.82L0.5 4.09L4.91 4.09L6.5 0Z"
                      fill="white"
                    />
                  </svg>
                  <a href="/seller" className={styles.bottomLink}>
                    Become a Seller
                  </a>
                </div>
                <div className={styles.bottomLinkItem}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect x="1" y="1" width="12" height="12" rx="2" stroke="white" strokeWidth="1.5" />
                    <path
                      d="M4 7L6 9L10 5"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <a href="/advertise" className={styles.bottomLink}>
                    Advertise
                  </a>
                </div>
                <div className={styles.bottomLinkItem}>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <rect x="1" y="1" width="11" height="11" rx="2" stroke="white" strokeWidth="1.5" />
                    <path d="M4.5 6.5H8.5M6.5 4.5V8.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <a href="/gift-cards" className={styles.bottomLink}>
                    Gift Cards
                  </a>
                </div>
                <div className={styles.bottomLinkItem}>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <circle cx="6.5" cy="6.5" r="5.5" stroke="white" strokeWidth="1.5" />
                    <path
                      d="M6.5 4.5V6.5L8.5 8.5"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <a href="/help" className={styles.bottomLink}>
                    Help Center
                  </a>
                </div>
              </div>
            </div>
            <div className="col-md-4 text-md-end">
              <span className={styles.copyright}>
                © 2007-2025 <span className={styles.companyName}>Company.com</span>
              </span>
            </div>
          </div>
          <div className="row mt-3">
            <div className="col-12 text-center">
              <div className={styles.paymentMethods}>
                <span className={styles.paymentText}>Payment Methods:</span>
                <div className={styles.paymentIcons}>
                  <span className={styles.paymentIcon}>💳</span>
                  <span className={styles.paymentIcon}>🏦</span>
                  <span className={styles.paymentIcon}>📱</span>
                  <span className={styles.paymentIcon}>💰</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

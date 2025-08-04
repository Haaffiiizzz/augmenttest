

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        {/* Left column: Logo & description */}
        <div className="footer-column">
          <img src="assets/images/logo.png" alt="PDMA Logo" className="footer-logo" />
          <p>
            AI-powered learning platform for learners and creators worldwide.
          </p>
          <div className="footer-socials">
            <img src="assets/icons/linkedin.png" alt="LinkedIn" />
            <img src="assets/icons/instagram.png" alt="Instagram" />
            <img src="assets/icons/twitter.png" alt="X/Twitter" />
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-column">
          <h4>Quick Links</h4>
          <ul>
            <li>Courses</li>
            <li>Teach</li>
            <li>Events</li>
            <li>Careers</li>
          </ul>
        </div>

        {/* Support */}
        <div className="footer-column">
          <h4>Support</h4>
          <ul>
            <li>Help Center</li>
            <li>Contact Us</li>
            <li>System Status</li>
            <li>Accessibility</li>
          </ul>
        </div>

        {/* Legal */}
        <div className="footer-column">
          <h4>Legal</h4>
          <ul>
            <li>Terms of Service</li>
            <li>Privacy Policy</li>
            <li>Cookie Policy</li>
            <li>Copyright</li>
          </ul>
        </div>
      </div>

      {/* Bottom copyright */}
      <div className="footer-bottom">
        <p>© 2025 PDMA. All rights reserved.</p>
      </div>
    </footer>
  );
}

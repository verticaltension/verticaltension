export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <div className="brand">
            <img
              src="/publisher_logo/Vertical%20Tension%20Press%20Logo%201024x1024%20Trans%20Fin.png"
              alt="Vertical Tension Press logo"
            />
            <span>Vertical Tension Press</span>
          </div>
          <p className="muted">
            Independent publisher of speculative science, philosophical synthesis,
            and long-arc cultural intelligence.
          </p>
        </div>
        <div>
          <strong>Contact</strong>
          <p>inquiries@verticaltension.com</p>
          <p>Berlin, DE</p>
        </div>
        <div>
          <strong>Follow</strong>
          <p>X and LinkedIn profiles coming soon.</p>
        </div>
      </div>
      <div className="container footer-note">
        This publication uses the Minion Pro font family: Regular, Italic,
        Semi-Bold, Bold, and Bold Italic, lawfully licensed under the Adobe
        Desktop EULA with extended rights for use in Electronic Documents and
        eBooks.
      </div>
    </footer>
  );
}

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="logo">
        <img src="assets/images/logo.png" alt="PDMA Logo" />
      </div>
      <nav>
        <ul className="nav-links">
          <li><a href="#">Home</a></li>
          <li><a href="#">Creators</a></li>
          <li><a href="#">Courses</a></li>
          <li><a href="#">Community</a></li>
        </ul>
      </nav>
      <div className="nav-buttons">
        <button className="login-btn">Log In</button>
        <button className="start-btn">Get Started</button>
      </div>
    </header>
  );
}
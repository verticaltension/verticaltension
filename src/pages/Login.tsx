import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStorefront } from "../context/StorefrontContext";

export default function Login() {
  const navigate = useNavigate();
  const { isAuthenticated, loginUser } = useStorefront();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const result = loginUser({ email, password });
    if (!result.ok) {
      setError(result.error);
      return;
    }

    navigate("/account");
  };

  return (
    <div className="page">
      <section className="section">
        <div className="container account-layout">
          <div className="card">
            <h2>Login</h2>
            <p className="muted">
              Login to manage your profile details, wishlist, and cart.
            </p>
            {isAuthenticated && (
              <p className="muted">
                You are already logged in. Go to <Link to="/account">Account</Link>.
              </p>
            )}
            <form className="form" onSubmit={handleSubmit}>
              <label>
                Email
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Your password"
                />
              </label>
              <div className="form-actions">
                <button className="button ghost" type="submit">
                  Login
                </button>
                <Link className="button ghost" to="/register">
                  Register
                </Link>
              </div>
              {error && <p className="muted">{error}</p>}
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

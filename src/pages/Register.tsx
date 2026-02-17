import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStorefront } from "../context/StorefrontContext";

export default function Register() {
  const navigate = useNavigate();
  const { isAuthenticated, registerUser } = useStorefront();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const result = registerUser({ name, email, password });
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
            <h2>Register</h2>
            <p className="muted">
              Create your local storefront account to manage profile data,
              wishlist, and cart from one place.
            </p>
            <p className="muted">
              Password must be at least 10 characters and include uppercase,
              lowercase, a number, and a symbol.
            </p>
            {isAuthenticated && (
              <p className="muted">
                You are already logged in. Go to <Link to="/account">Account</Link>.
              </p>
            )}
            <form className="form" onSubmit={handleSubmit}>
              <label>
                Name
                <input
                  type="text"
                  name="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your name"
                />
              </label>
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
                  placeholder="At least 10 characters, mixed types"
                />
              </label>
              <label>
                Confirm password
                <input
                  type="password"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Repeat password"
                />
              </label>
              <div className="form-actions">
                <button className="button ghost" type="submit">
                  Register
                </button>
                <Link className="button ghost" to="/login">
                  Login
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

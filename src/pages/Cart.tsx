import { Link } from "react-router-dom";
import { useStorefront } from "../context/StorefrontContext";
import { PAYHIP_CART_URL, getPayhipHref, markCheckoutPending } from "../lib/payhip";

export default function Cart() {
  const { cart, cartCount, removeCartItem, clearCart } = useStorefront();

  const handleProceedToCheckout = () => {
    markCheckoutPending();
  };

  return (
    <div className="page">
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="badge">Cart</span>
            <h1>Review your selected titles</h1>
            <p>
              This is your on-site staging cart. Final payment and checkout are
              completed on Payhip.
            </p>
          </div>
          <div className="hero-panel">
            <h2>Cart Status</h2>
            <ul>
              <li>{cartCount} items selected</li>
              <li>Checkout provider: Payhip</li>
              <li>Secure payment handled off-site</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {cart.length === 0 ? (
            <div className="card">
              <h2>Your cart is empty</h2>
              <p className="muted">
                Add titles from the shop, then return here for checkout.
              </p>
              <div className="button-row">
                <Link className="button ghost" to="/shop">
                  Go to Shop
                </Link>
              </div>
            </div>
          ) : (
            <div className="card-grid">
              {cart.map((item) => (
                <article className="card" key={item.id}>
                  <h3>{item.title}</h3>
                  <div className="meta">
                    <span>{item.category}</span>
                    <span>{item.status}</span>
                    <span>{item.format}</span>
                  </div>
                  <div className="button-row cart-actions">
                    <a className="button ghost" href={getPayhipHref(item.payhipProductKey)}>
                      View on Payhip
                    </a>
                    <button
                      className="button ghost"
                      type="button"
                      onClick={() => removeCartItem(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container banner">
          <div>
            <span className="badge">Checkout</span>
            <h2>Ready to complete your order?</h2>
            <p>
              Use the button to continue to Payhip for final checkout and
              payment processing, then return to the on-site thank-you page.
            </p>
          </div>
          <div className="button-row">
            <Link className="button ghost" to="/shop">
              Continue Shopping
            </Link>
            <button className="button ghost" type="button" onClick={clearCart}>
              Clear Cart
            </button>
            <a
              className="button primary"
              href={PAYHIP_CART_URL}
              onClick={handleProceedToCheckout}
            >
              Proceed to Payhip Checkout
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

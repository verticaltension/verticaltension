import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import ConsentBanner from "./components/ConsentBanner";

const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Shop = lazy(() => import("./pages/Shop"));
const Cart = lazy(() => import("./pages/Cart"));
const Account = lazy(() => import("./pages/Account"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Contact = lazy(() => import("./pages/Contact"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const ThankYou = lazy(() => import("./pages/ThankYou"));
const Impressum = lazy(() => import("./pages/Impressum"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Withdrawal = lazy(() => import("./pages/Withdrawal"));
const ShippingPayment = lazy(() => import("./pages/ShippingPayment"));

export default function App() {
  return (
    <div className="app-shell">
      <Nav />
      <main>
        <Suspense
          fallback={
            <section className="section">
              <div className="container">
                <p className="muted">Loading page...</p>
              </div>
            </section>
          }
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/account" element={<Account />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/thank-you" element={<ThankYou />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route
              path="/alien-echoes"
              element={
                <Navigate
                  to="/blog/alien-echoes-consolidated-overview"
                  replace
                />
              }
            />
            <Route path="/impressum" element={<Impressum />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/withdrawal" element={<Withdrawal />} />
            <Route path="/shipping-payment" element={<ShippingPayment />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <ConsentBanner />
    </div>
  );
}

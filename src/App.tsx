import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import Nav from "./components/Nav";
import Footer from "./components/Footer";

const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Shop = lazy(() => import("./pages/Shop"));
const Contact = lazy(() => import("./pages/Contact"));
const AlienEchoes = lazy(() => import("./pages/AlienEchoes"));
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
            <Route path="/contact" element={<Contact />} />
            <Route path="/alien-echoes" element={<AlienEchoes />} />
            <Route path="/impressum" element={<Impressum />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/withdrawal" element={<Withdrawal />} />
            <Route path="/shipping-payment" element={<ShippingPayment />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

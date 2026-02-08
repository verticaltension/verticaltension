import { Route, Routes } from "react-router-dom";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Shop from "./pages/Shop";
import Contact from "./pages/Contact";
import AlienEchoes from "./pages/AlienEchoes";
import Impressum from "./pages/Impressum";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Withdrawal from "./pages/Withdrawal";
import ShippingPayment from "./pages/ShippingPayment";

export default function App() {
  return (
    <div className="app-shell">
      <Nav />
      <main>
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
      </main>
      <Footer />
    </div>
  );
}

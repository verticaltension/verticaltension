import { useState, type ChangeEvent, type FormEvent } from "react";

const initialForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

export default function Contact() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");
    try {
      const response = await fetch("https://api.verticaltension.com/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!response.ok) {
        throw new Error("Contact request failed");
      }
      setStatus("sent");
      setForm(initialForm);
    } catch (error) {
      setStatus("error");
    }
  };
  return (
    <div className="page">
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="badge">Contact</span>
            <h1>Start a Conversation</h1>
            <p>
              We welcome partnerships, reviewer inquiries, and distribution
              requests. Share a concise note and the nature of your proposal.
            </p>
          </div>
          <div className="hero-panel">
            <h2>Direct Channels</h2>
            <ul>
              <li>inquiries@verticaltension.com</li>
              <li>Berlin, DE</li>
              <li>Press Kit on Request</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Send a Message</h2>
            <p>
              Messages are captured via the Vertical Tension Press inbox. You
              will receive a response within a few days.
            </p>
            {status === "sent" && (
              <p className="muted">Message received. We will reply soon.</p>
            )}
            {status === "error" && (
              <p className="muted">
                Something went wrong. Email us directly instead.
              </p>
            )}
          </div>
          <form className="form" onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Name"
              aria-label="Name"
            />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              aria-label="Email"
            />
            <input
              type="text"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              placeholder="Subject"
              aria-label="Subject"
            />
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Tell us about your project"
              aria-label="Message"
            />
            <button className="button primary" type="submit">
              {status === "sending" ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

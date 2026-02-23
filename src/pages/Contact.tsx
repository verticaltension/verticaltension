import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { apiUrl } from "../lib/api";
import { siteIdentity, siteIdentityText } from "../config/siteIdentity";

const initialForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
  company: "",
};

export default function Contact() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [statusMessage, setStatusMessage] = useState("");

  const isFormValid = useMemo(() => {
    return (
      form.name.trim().length > 0 &&
      form.email.trim().length > 0 &&
      form.message.trim().length > 0
    );
  }, [form]);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isFormValid || status === "sending") {
      return;
    }

    // Honeypot trap for basic bot submissions.
    if (form.company.trim().length > 0) {
      setStatus("sent");
      setStatusMessage("Message received. We will reply soon.");
      setForm(initialForm);
      return;
    }

    setStatus("sending");
    setStatusMessage("");
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(apiUrl("/api/contact"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        signal: controller.signal,
      });
      if (!response.ok) {
        const payload = await response
          .json()
          .catch(() => ({ error: "Contact request failed." }));
        const retryAfter = response.headers.get("Retry-After");
        if (response.status === 429 && retryAfter) {
          throw new Error(
            `Too many requests. Please retry in about ${retryAfter} seconds.`
          );
        }
        throw new Error(payload.error || "Contact request failed.");
      }
      setStatus("sent");
      setStatusMessage("Message received. We will reply soon.");
      setForm(initialForm);
    } catch (error) {
      setStatus("error");
      if (error instanceof DOMException && error.name === "AbortError") {
        setStatusMessage("Request timed out. Please try again or email us directly.");
      } else if (error instanceof Error) {
        setStatusMessage(error.message);
      } else {
        setStatusMessage("Something went wrong. Email us directly instead.");
      }
    } finally {
      window.clearTimeout(timeoutId);
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
              <li>
                <a href={siteIdentity.contact.emailHref}>
                  {siteIdentity.contact.email}
                </a>
              </li>
              <li>{siteIdentityText.addressLine}</li>
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
              Messages are captured via the {siteIdentity.brandName} inbox. You
              will receive a response within a few days.
            </p>
            {statusMessage && (
              <p className="muted" role="status" aria-live="polite">
                {statusMessage}
              </p>
            )}
          </div>
          <form className="form" onSubmit={handleSubmit} aria-busy={status === "sending"}>
            <label>
              <span>
                Name <span className="required">*</span>
              </span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Name"
                required
                autoComplete="name"
                maxLength={120}
              />
            </label>
            <label>
              <span>
                Email <span className="required">*</span>
              </span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email"
                required
                autoComplete="email"
                inputMode="email"
                maxLength={254}
              />
            </label>
            <label>
              Subject (Optional)
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="Subject"
                maxLength={200}
              />
            </label>
            <label>
              <span>
                Message <span className="required">*</span>
              </span>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Tell us about your project"
                required
                maxLength={5000}
              />
            </label>
            <label
              style={{
                position: "absolute",
                left: "-10000px",
                width: "1px",
                height: "1px",
                overflow: "hidden",
              }}
              aria-hidden="true"
            >
              Company
              <input
                type="text"
                name="company"
                value={form.company}
                onChange={handleChange}
                tabIndex={-1}
                autoComplete="off"
              />
            </label>
            <div className="form-actions">
              <button
                className="button primary"
                type="submit"
                disabled={status === "sending" || !isFormValid}
              >
                {status === "sending" ? "Sending..." : "Send Message"}
              </button>
              <p className="muted">* Required Fields</p>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

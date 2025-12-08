export default function LegalPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "1rem 0",
        background: "linear-gradient(145deg, #181d33 0%, #30264a 100%)",
        color: "#ffffff",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <section
        style={{
          maxWidth: "900px",
          width: "90%",
          padding: "4rem 3rem",
          margin: "80px 0",
          borderRadius: "16px",
          background: "rgba(255, 255, 255, 0.05)",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <h1
          style={{
            fontSize: "3.2rem",
            fontWeight: "900",
            marginBottom: "1.5rem",
            color: "#b0c4de",
          }}
        >
          Company Policies & Legal Information
        </h1>

        <p style={{ fontSize: "1.2rem", lineHeight: "1.6", marginBottom: "3rem" }}>
          Transparency is key to Grit and Grace aka The Resilient Voice. Below you will find all the necessary information regarding how we operate, process orders, and protect your privacy.
        </p>

        {/* 🚚 Shipping Policy */}
        <section style={{ marginBottom: "3rem" }}>
          <h2 style={{ color: "#87cefa" }}>🚚 Shipping Policy</h2>
          <p>Every item is made to order through our fulfillment partner, Printful. Processing time is 2–7 business days.</p>
          <ul>
            <li>USA: 3–7 business days</li>
            <li>Canada: 5–12 business days</li>
            <li>International: 7–20 business days</li>
          </ul>
          <p>Shipping costs are calculated at checkout. Tracking numbers are emailed once your order ships. Incorrect addresses may result in returns, and reshipment costs are the customer’s responsibility.</p>
        </section>

        {/* 🔄 Refund & Return Policy */}
        <section style={{ marginBottom: "3rem" }}>
          <h2 style={{ color: "#87cefa" }}>🔄 Refund & Return Policy</h2>
          <p>Because each item is custom made, we do not accept returns for buyer’s remorse or wrong size ordered. We will replace or refund items that arrive damaged, misprinted, defective, or incorrect.</p>
          <p>To request a replacement, contact <a href="mailto:info@gritandgrace.buzz" style={{ color: "#ffc0cb" }}>support@theresilientvoice.com</a> within 14 days of delivery with your order number, photos, and description of the issue.</p>
          <p>Sale items, gift cards, and customer-damaged products are non-returnable.</p>
        </section>

        {/* ⚖️ Terms of Service */}
        <section style={{ marginBottom: "3rem" }}>
          <h2 style={{ color: "#87cefa" }}>⚖️ Terms of Service</h2>
          <ul>
            <li>No illegal or unauthorized use of our site</li>
            <li>All items are made to order; prices may change</li>
            <li>We strive for accuracy but cannot guarantee error-free descriptions</li>
            <li>We reserve the right to refuse orders for suspected fraud or incorrect info</li>
            <li>We use Printful (fulfillment) and Stripe/PayPal (payments)</li>
            <li>All designs and content belong to The Resilient Voice</li>
          </ul>
          <p>Questions? Email <a href="mailto:info@gritandgrace.buzz" style={{ color: "#ffc0cb" }}>legal@theresilientvoice.com</a></p>
        </section>

        {/* 🔒 Privacy Policy */}
        <section style={{ marginBottom: "3rem" }}>
          <h2 style={{ color: "#87cefa" }}>🔒 Privacy Policy</h2>
          <p>We collect only what we need to serve you well: name, email, shipping address, payment info (securely handled), order details, and site usage data.</p>
          <p>We use this info to process orders, communicate with you, improve our site, and prevent fraud. We never sell your data.</p>
          <p>Your data may be shared with Printful, Stripe/PayPal, and analytics tools. SSL encryption and secure systems protect your information.</p>
          <p>Privacy questions? Email <a href="mailto:info@gritandgrace.buzz" style={{ color: "#ffc0cb" }}>privacy@theresilientvoice.com</a></p>
        </section>

        {/* ❓ FAQ */}
        <section style={{ marginBottom: "3rem" }}>
          <h2 style={{ color: "#87cefa" }}>❓ Frequently Asked Questions (FAQ)</h2>
          <ul>
            <li><strong>What is Grit & Grace?</strong> Our apparel line blending rugged American grit with the grace of faith and conviction.</li>
            <li><strong>How do I choose the right size?</strong> Each product page includes a size chart and variant selector.</li>
            <li><strong>Can I return something if I ordered the wrong size?</strong> We don’t accept returns for buyer’s remorse, but we replace defective or incorrect items.</li>
            <li><strong>How long does shipping take?</strong> See our Shipping Policy above.</li>
            <li><strong>Do you support nonprofits?</strong> Yes — we actively support causes aligned with faith, freedom, and resilience.</li>
          </ul>
        </section>

        <p style={{ fontSize: "1rem", lineHeight: "1.6", marginTop: "4rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}>
          For specific legal inquiries, please contact us at <a href="mailto:info@gritandgrace.buzz" style={{ color: "#ffc0cb", textDecoration: "none" }}>legal@theresilientvoice.com</a>.
        </p>
      </section>
    </main>
  );
}

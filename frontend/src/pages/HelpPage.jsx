export default function HelpPage() {
  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <section className="card" style={{ padding: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 18 }}>About CampusMitra</div>
        <p className="label">A multilingual campus assistant to help students with notifications, FAQs, and chat-based support.</p>
        <div style={{ marginTop: 8 }}>
          <div style={{ fontWeight: 600 }}>Team</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Team Member 1</li>
            <li>Team Member 2</li>
            <li>Team Member 3</li>
          </ul>
        </div>
      </section>

      <section className="card" style={{ padding: 16 }} id="contact">
        <div style={{ fontWeight: 700, fontSize: 18 }}>Contact</div>
        <form style={{ display: 'grid', gap: 12, marginTop: 8 }} onSubmit={(e) => e.preventDefault()}>
          <div>
            <div className="label">Name</div>
            <input className="input" placeholder="Your name" />
          </div>
          <div>
            <div className="label">Email</div>
            <input className="input" placeholder="you@example.com" type="email" />
          </div>
          <div>
            <div className="label">Message</div>
            <textarea className="textarea" placeholder="Write your message..." rows={4}></textarea>
          </div>
          <button className="btn primary" type="submit">Send</button>
        </form>
      </section>

      <section className="card" style={{ padding: 16 }} id="privacy">
        <div style={{ fontWeight: 700, fontSize: 18 }}>Privacy</div>
        <p className="label">We take your privacy seriously. This is a demo UI; no data is sent anywhere.</p>
      </section>

      <section className="card" style={{ padding: 16 }} id="terms">
        <div style={{ fontWeight: 700, fontSize: 18 }}>Terms</div>
        <p className="label">By using this prototype, you agree to the demo-only nature of the app.</p>
      </section>
    </div>
  )
}



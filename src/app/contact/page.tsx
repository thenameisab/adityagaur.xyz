export default function ContactPage() {
  return (
    <main className="container" style={{ padding: '5vh 5vw', minHeight: '80vh' }}>
      <h1 className="h1-serif" style={{ fontSize: '4rem', marginBottom: '2rem' }}>Contact</h1>
      <p className="body-sans" style={{ fontSize: '1.25rem', opacity: 0.8, maxWidth: '600px', marginBottom: '4rem' }}>
        Reach out to discuss strategy, AI systems, or potential collaborations.
      </p>
      
      <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '500px' }}>
        <input type="text" placeholder="Name" style={{ padding: '1rem', background: 'transparent', border: '1px solid var(--accent)', borderRadius: '0.5rem', color: 'var(--foreground)', fontFamily: 'var(--font-sans)', fontSize: '1rem' }} />
        <input type="email" placeholder="Email" style={{ padding: '1rem', background: 'transparent', border: '1px solid var(--accent)', borderRadius: '0.5rem', color: 'var(--foreground)', fontFamily: 'var(--font-sans)', fontSize: '1rem' }} />
        <textarea placeholder="Message" rows={5} style={{ padding: '1rem', background: 'transparent', border: '1px solid var(--accent)', borderRadius: '0.5rem', color: 'var(--foreground)', fontFamily: 'var(--font-sans)', resize: 'none', fontSize: '1rem' }}></textarea>
        <button type="button" style={{ padding: '1rem 2rem', background: 'var(--foreground)', color: 'var(--background)', border: 'none', borderRadius: '0.5rem', fontFamily: 'var(--font-sans)', cursor: 'pointer', fontSize: '1.1rem' }}>Send Message</button>
      </form>
    </main>
  );
}

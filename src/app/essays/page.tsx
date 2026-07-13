export default function EssaysPage() {
  return (
    <main className="container" style={{ padding: '5vh 5vw', minHeight: '80vh' }}>
      <h1 className="h1-serif" style={{ fontSize: '4rem', marginBottom: '2rem' }}>Essays & Thinking</h1>
      <p className="body-sans" style={{ fontSize: '1.25rem', opacity: 0.8, maxWidth: '600px', marginBottom: '4rem' }}>
        Reflections on AI, strategy, and operations.
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <article style={{ padding: '2rem', border: '1px solid var(--accent)', borderRadius: '1rem' }}>
          <span style={{ fontFamily: 'monospace', opacity: 0.5 }}>July 2026</span>
          <h2 className="h2-serif" style={{ fontSize: '2rem', margin: '1rem 0' }}>The Era of the Local AI Agent</h2>
          <p className="body-sans" style={{ opacity: 0.8 }}>Coming soon...</p>
        </article>
      </div>
    </main>
  );
}

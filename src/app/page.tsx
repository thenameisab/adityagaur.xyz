import Hero from '@/components/Hero';

export default function Home() {
  return (
    <main style={{ position: 'relative', zIndex: 10 }}>
      <Hero />
      
      <footer className="container" style={{ padding: '10vh 5vw', textAlign: 'center', opacity: 0.5, marginTop: '20vh' }}>
        <p className="body-sans">Built by Aditya Gaur. © 2026.</p>
      </footer>
    </main>
  );
}

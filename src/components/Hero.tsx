import React from 'react';
import Image from 'next/image';

export default function Hero() {
  return (
    <section className="editorial-section container" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center',
      position: 'relative'
    }}>
      <div style={{ position: 'relative', zIndex: 10 }}>
        <h1 className="h1-serif" style={{ marginBottom: '2rem', maxWidth: '800px' }}>
          Aditya Gaur.<br />
          Chief of Staff & AI Builder.
        </h1>
        <p className="body-sans" style={{ maxWidth: '500px', fontSize: '1.25rem', opacity: 0.8, marginBottom: '3rem' }}>
          Orchestrating corporate strategy, GTM architecture, and multi-agent AI systems to drive hyper-growth and operational excellence.
        </p>
      </div>

      {/* Floating digital impressionism art element */}
      <div style={{ 
        position: 'absolute', 
        right: '5%', 
        top: '50%', 
        transform: 'translateY(-50%)',
        width: '400px', 
        height: '500px',
        borderRadius: '4px',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        zIndex: 5
      }}>
        {/* We use standard img to avoid next/image domain config requirements right now */}
        <img 
          src="https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=800&auto=format&fit=crop" 
          alt="Digital Impressionism"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
    </section>
  );
}

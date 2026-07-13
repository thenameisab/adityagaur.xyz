'use client';
import React from 'react';

const projects = [
  { id: 'AX-01', title: 'Generative Agents', col: 'span 2', row: 'span 2', img: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop' },
  { id: 'AX-02', title: 'Autonomous Workflows', col: 'span 1', row: 'span 1', img: null },
  { id: 'AX-03', title: 'Digital Architectures', col: 'span 1', row: 'span 1', img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop' },
  { id: 'AX-04', title: 'Neural Interfaces', col: 'span 2', row: 'span 1', img: null },
  { id: 'AX-05', title: 'System Synthesis', col: 'span 2', row: 'span 1', img: 'https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?q=80&w=800&auto=format&fit=crop' }
];

export default function BentoGrid() {
  return (
    <section className="editorial-section container">
      <h2 className="h2-serif" style={{ marginBottom: '4rem' }}>Observed Systems</h2>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1rem',
        gridAutoRows: '300px'
      }}>
        {projects.map((project, i) => (
          <div key={i} style={{
            gridColumn: project.col,
            gridRow: project.row,
            border: '1px solid var(--accent)',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: 'rgba(0,0,0,0.02)'
          }}>
            <div style={{ position: 'relative', zIndex: 10 }}>
              <div style={{ fontFamily: 'monospace', fontSize: '0.875rem', opacity: 0.5, letterSpacing: '0.1em' }}>
                {project.id}
              </div>
              <h3 className="h2-serif" style={{ fontSize: '2.5rem', marginTop: '1rem', lineHeight: 1.1 }}>
                {project.title}
              </h3>
            </div>
            
            {/* Background impressionism art */}
            {project.img && (
              <div style={{ position: 'absolute', right: 0, bottom: 0, width: '100%', height: '100%', opacity: 0.2, zIndex: 0, transition: 'opacity 0.3s ease' }}
                   onMouseOver={(e) => e.currentTarget.style.opacity = '0.6'}
                   onMouseOut={(e) => e.currentTarget.style.opacity = '0.2'}
              >
                <img 
                  src={project.img} 
                  alt={project.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

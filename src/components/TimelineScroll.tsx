'use client';
import React, { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';

const timelineData = [
  { year: "2025 - Present", role: "Chief of Staff", company: "TartanHQ", desc: "Driving $2.5M acquisition and $15M+ Series A strategy. Architecting GTM and deploying local AI agents to automate workflows." },
  { year: "2022 - 2025", role: "Chief of Staff, Strategy Manager", company: "Mindflow", desc: "Led strategic partnerships and investor relations across 7 VC funds, securing €5M Seed. Drove massive B2B pipeline growth." },
  { year: "2023 - 2024", role: "Venture Scout", company: "First Momentum Venture", desc: "Sourced and evaluated early-stage Deep Tech and FinTech startups. Built deal flow pipelines for investment decisions." },
  { year: "2021", role: "Strategic Initiatives", company: "Powder", desc: "Secured €2.5M European Innovation Council Grant and established 15 key partner relationships." },
  { year: "2018 - 2020", role: "Co-founder, Strategy & Ops", company: "Sordit", desc: "Led 7-person team across sales, marketing, and operations, driving early-stage scaling and infrastructure." }
];

function TitleItem({ item, index, progress, total }: { item: any, index: number, progress: MotionValue<number>, total: number }) {
  const step = 1 / total;
  const start = index * step;
  const end = (index + 1) * step;
  
  // Calculate strictly non-decreasing arrays for framer-motion WAAPI compatibility
  const inStart = index === 0 ? 0 : start - 0.05;
  const inEnd = index === 0 ? 0.001 : start;
  const outStart = index === total - 1 ? 0.999 : end;
  const outEnd = index === total - 1 ? 1 : end + 0.05;

  const opacity = useTransform(progress, [inStart, inEnd, outStart, outEnd], [0.3, 1, 1, 0.3]);
  const scale = useTransform(progress, [inStart, inEnd, outStart, outEnd], [0.95, 1, 1, 0.95]);

  return (
    <motion.div style={{ opacity, scale, originX: 0 }}>
      <h3 className="h1-serif" style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', margin: 0, lineHeight: 1.1 }}>
        {item.company}
      </h3>
    </motion.div>
  );
}

function DescItem({ item, index, progress, total }: { item: any, index: number, progress: MotionValue<number>, total: number }) {
  const step = 1 / total;
  const start = index * step;
  const end = (index + 1) * step;
  
  const inStart = index === 0 ? 0 : start - 0.05;
  const inEnd = index === 0 ? 0.001 : start;
  const outStart = index === total - 1 ? 0.999 : end;
  const outEnd = index === total - 1 ? 1 : end + 0.05;

  const opacity = useTransform(progress, [inStart, inEnd, outStart, outEnd], [0, 1, 1, 0]);
  const y = useTransform(progress, [inStart, inEnd, outStart, outEnd], [40, 0, 0, -40]);
  
  // We only want the active description to be visible/clickable, but we use absolute positioning so they stack on top of each other.
  return (
    <motion.div 
      style={{ 
        opacity, 
        y, 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%',
        pointerEvents: 'none' // Prevent blocking interactions if they overlap
      }}
    >
      <div style={{ fontFamily: 'monospace', fontSize: '1rem', opacity: 0.6, marginBottom: '1.5rem', letterSpacing: '0.05em', color: 'var(--accent)' }}>
        {item.year}
      </div>
      <h4 className="h2-serif" style={{ fontSize: '2rem', marginBottom: '1rem', lineHeight: 1.2 }}>
        {item.role}
      </h4>
      <p className="body-sans" style={{ fontSize: '1.25rem', opacity: 0.8, maxWidth: '500px' }}>
        {item.desc}
      </p>
    </motion.div>
  );
}

export default function TimelineScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track scroll over the entire 500vh container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  return (
    <section ref={containerRef} style={{ height: `${timelineData.length * 100}vh`, position: 'relative' }}>
      
      {/* Background Impressionism Art */}
      <div style={{
          position: 'absolute',
          top: 0, right: 0, width: '100%', height: '100%',
          opacity: 0.05,
          zIndex: 0,
      }}>
        <img 
          src="https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=2000&auto=format&fit=crop" 
          alt="Abstract"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* The Sticky Viewport Container */}
      <div style={{ 
        position: 'sticky', 
        top: 0, 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center',
        zIndex: 10,
        overflow: 'hidden'
      }}>
        <div className="container" style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '4rem', 
          width: '100%',
          alignItems: 'center'
        }}>
           
           {/* Left Column: Fixed List of Companies */}
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ marginBottom: '2rem', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.875rem' }}>
                Career Timeline
              </div>
              {timelineData.map((item, i) => (
                <TitleItem key={i} index={i} item={item} progress={scrollYProgress} total={timelineData.length} />
              ))}
           </div>

           {/* Right Column: Sliding Descriptions */}
           <div style={{ position: 'relative', height: '300px' }}>
              {timelineData.map((item, i) => (
                <DescItem key={i} index={i} item={item} progress={scrollYProgress} total={timelineData.length} />
              ))}
           </div>

        </div>
      </div>
    </section>
  );
}

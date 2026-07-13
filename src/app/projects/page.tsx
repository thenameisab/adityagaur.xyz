import BentoGrid from '@/components/BentoGrid';

export default function ProjectsPage() {
  return (
    <main style={{ paddingBottom: '10vh' }}>
      <h2 className="h2-serif" style={{ textAlign: 'center', margin: '2rem 0 4rem 0', fontSize: '4rem' }}>Observed Systems</h2>
      <BentoGrid />
    </main>
  );
}

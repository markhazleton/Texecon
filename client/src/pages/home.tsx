import Navigation from '@/components/navigation';
import Hero from '@/components/hero';
import Mission from '@/components/mission';
import Team from '@/components/team';
import Insights from '@/components/insights';
import Dashboard from '@/components/dashboard';
import Newsletter from '@/components/newsletter';
import Footer from '@/components/footer';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <Hero />
        <Mission />
        <Team />
        <Insights />
        <Dashboard />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

function daysAgoISO(days) {
  return new Date(Date.now() - days * 86400000).toISOString();
}

export default function AdminMetrics() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const since7d = daysAgoISO(7);

      const [
        { count: totalUsers },
        { count: newUsers7d },
        { count: activeSessions7d },
        { count: savedPhrases },
        { data: payments },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_date', since7d),
        supabase.from('practice_sessions').select('*', { count: 'exact', head: true }).gte('created_date', since7d),
        supabase.from('vocabulary_phrases').select('*', { count: 'exact', head: true }).eq('saved', true),
        supabase.from('payments').select('amount, created_date').eq('status', 'COMPLETED'),
      ]);

      const totalRevenue = (payments || []).reduce((sum, p) => sum + Number(p.amount), 0);
      const revenue7d = (payments || [])
        .filter((p) => p.created_date >= since7d)
        .reduce((sum, p) => sum + Number(p.amount), 0);

      setMetrics({
        totalUsers,
        newUsers7d,
        activeSessions7d,
        savedPhrases,
        totalRevenue,
        revenue7d,
      });
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <p>Loading metrics...</p>;

  const cards = [
    { label: 'Total Users', value: metrics.totalUsers },
    { label: 'New Signups (7d)', value: metrics.newUsers7d },
    { label: 'Practice Sessions (7d)', value: metrics.activeSessions7d },
    { label: 'Phrases Saved', value: metrics.savedPhrases },
    { label: 'Revenue (7d)', value: `$${metrics.revenue7d.toFixed(2)}` },
    { label: 'Total Revenue', value: `$${metrics.totalRevenue.toFixed(2)}` },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
      {cards.map((c) => (
        <div key={c.label} style={{ border: '1px solid #eee', borderRadius: 8, padding: '1rem' }}>
          <div style={{ fontSize: '0.85rem', color: '#666' }}>{c.label}</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{c.value}</div>
        </div>
      ))}
    </div>
  );
}

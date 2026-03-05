// GFS Operations Dashboard Page

import { Metadata } from 'next';
import OpsDashboard from '@/components/gfs/ops-dashboard';

export const metadata: Metadata = {
  title: 'Operations Center | GhostFoundry-Syndicate',
  description: 'Real-time monitoring of the Ghost nervous system',
};

export default function OpsPage() {
  return <OpsDashboard />;
}

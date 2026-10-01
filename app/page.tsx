import type { Metadata } from 'next';
import { EventeesShell } from '@/components/eventees/Shell';
import { Discover } from '@/components/eventees/Discover';
export const metadata: Metadata = { title: 'Entdecken', description: 'Dein Event. Deine Menschen. Entdecke eventees in der interaktiven Vorschau.' };
export default function Page() { return <EventeesShell><Discover /></EventeesShell>; }

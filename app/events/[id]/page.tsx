import { notFound } from 'next/navigation';
import { EventeesShell } from '@/components/eventees/Shell';
import { Hub } from '@/components/eventees/Hub';
import { DEMO_EVENTS } from '@/lib/eventees/fixtures';
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const event = DEMO_EVENTS.find(e => e.id === id); if (!event) notFound(); return <EventeesShell><Hub event={event} /></EventeesShell>; }

import { EventeesShell } from '@/components/eventees/Shell';
import { MyEvents } from '@/components/eventees/Discover';
export const metadata = { title: 'Meine Events' };
export default function Page() { return <EventeesShell><MyEvents /></EventeesShell>; }

'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { EventeesProvider } from './State';
import { Icon, type IconName } from './Icon';
import './eventees.css';
const nav: { href: string; label: string; icon: IconName }[] = [{ href: '/', label: 'Entdecken', icon: 'search' }, { href: '/my-events', label: 'Meine Events', icon: 'ticket' }, { href: '/community', label: 'Community', icon: 'users' }, { href: '/profile', label: 'Profil', icon: 'user' }];
export function EventeesShell({ children }: { children: ReactNode }) {
  const pathname = usePathname(); const [notices, setNotices] = useState(false);
  return <EventeesProvider><div className="ev-app"><a href="#ev-content" className="ev-skip">Zum Inhalt</a>
    <aside className="ev-sidebar"><Link href="/" className="ev-wordmark">eventees<span>powered by Fancircle</span></Link><nav aria-label="Hauptnavigation">{nav.map(n => <Link href={n.href} key={n.href} className={pathname === n.href ? 'active' : ''}><Icon name={n.icon} />{n.label}{pathname === n.href && <span className="ev-dot" />}</Link>)}</nav>
      <div className="ev-sidebar-bottom"><div className="ev-small">JEDES EVENT IST EIN ANFANG.</div><p>Aus einem Moment<br />wird ein Wir.</p><Link href="/organization/auth/login"><Icon name="globe" /> Für Veranstalter <Icon name="arrow" size={15} /></Link></div>
    </aside>
    <div className="ev-main"><header className="ev-topbar"><Link href="/" className="ev-mobile-logo">eventees</Link><div className="ev-top-context"><span className="ev-live-dot" /> Gemeinsam mehr erleben</div><div className="ev-top-actions"><span className="ev-preview-label">Designvorschau · Beispieldaten</span><button className="ev-icon-button" aria-label="Mitteilungen öffnen" aria-expanded={notices} onClick={() => setNotices(!notices)}><Icon name="bell" /></button><Link href="/profile" className="ev-avatar ev-avatar-small" aria-label="Mein Profil">AL</Link></div>
      {notices && <div className="ev-notice-popover" role="status"><strong>Alles beginnt mit einem Event.</strong><p>In dieser Vorschau sind noch keine echten Mitteilungen verfügbar.</p><button onClick={() => setNotices(false)}>Schließen</button></div>}</header>
      <main id="ev-content" className="ev-content">{children}</main><footer className="ev-footer"><span>eventees · powered by Fancircle</span><span>Vorschau: Aktionen werden nur auf diesem Gerät gespeichert.</span></footer>
    </div><nav className="ev-bottom-nav" aria-label="Mobile Navigation">{nav.map(n => <Link key={n.href} href={n.href} className={pathname === n.href ? 'active' : ''}><Icon name={n.icon} /><span>{n.label}</span></Link>)}</nav>
  </div></EventeesProvider>;
}

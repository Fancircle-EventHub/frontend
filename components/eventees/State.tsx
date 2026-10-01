'use client';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { DEMO_VIEWER } from '@/lib/eventees/fixtures';
import { type FanProfile, type Visibility } from '@/lib/eventees/domain';
type State = { saved: string[]; joined: string[]; requests: string[]; meetups: string[]; rides: string[]; profile: FanProfile };
const initial: State = { saved: [], joined: [], requests: [], meetups: [], rides: [], profile: DEMO_VIEWER };
const key = 'eventees.preview.v1';
function readState(): State {
  if (typeof window === 'undefined') return initial;
  try { const raw = JSON.parse(localStorage.getItem(key) || 'null');
    if (!raw || !raw.profile || typeof raw.profile.city !== 'string' || typeof raw.profile.area !== 'string') return initial;
    const arrays = Object.fromEntries(['saved', 'joined', 'requests', 'meetups', 'rides'].map(k => [k, Array.isArray(raw[k]) ? raw[k].filter((x: unknown) => typeof x === 'string') : []]));
    const profile = { ...DEMO_VIEWER };
    for (const k of ['name', 'city', 'area', 'row', 'seat'] as const) if (typeof raw.profile[k] === 'string') profile[k] = raw.profile[k];
    profile.interests = Array.isArray(raw.profile.interests) ? raw.profile.interests.filter((x: unknown) => typeof x === 'string') : [];
    profile.visibility = { ...DEMO_VIEWER.visibility };
    for (const k of Object.keys(profile.visibility) as (keyof Visibility)[]) profile.visibility[k] = raw.profile.visibility?.[k] === true;
    return { ...initial, ...arrays, profile };
  } catch { return initial; }
}
const Context = createContext<{ state: State; toggle: (key: 'saved' | 'joined' | 'requests' | 'meetups' | 'rides', id: string) => void; setProfile: (profile: FanProfile) => void; setVisibility: (key: keyof Visibility, value: boolean) => void; reset: () => void; ready: boolean } | null>(null);
export function EventeesProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(initial); const [ready, setReady] = useState(false);
  useEffect(() => { const timer = window.setTimeout(() => { setState(readState()); setReady(true); }, 0); return () => clearTimeout(timer); }, []);
  useEffect(() => { if (ready) { try { localStorage.setItem(key, JSON.stringify(state)); } catch { /* Preview remains usable without persistence. */ } } }, [state, ready]);
  return <Context.Provider value={{ state, ready, toggle: (key, id) => setState(s => ({ ...s, [key]: s[key].includes(id) ? s[key].filter(x => x !== id) : [...s[key], id] })), setProfile: profile => setState(s => ({ ...s, profile })), setVisibility: (key, value) => setState(s => ({ ...s, profile: { ...s.profile, visibility: { ...s.profile.visibility, [key]: value } } })), reset: () => setState(initial) }}>{children}</Context.Provider>;
}
export function useEventees() { const context = useContext(Context); if (!context) throw new Error('EventeesProvider missing'); return context; }

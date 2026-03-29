import type { EventModuleId } from "@/constants/eventModules";
import { EVENT_MODULE_LIST } from "@/constants/eventModules";

export function defaultModulesState(): Record<EventModuleId, boolean> {
  const o = {} as Record<EventModuleId, boolean>;
  for (const m of EVENT_MODULE_LIST) {
    o[m.id] = false;
  }
  return o;
}

export function mergeModulesFromApi(raw: unknown): Record<EventModuleId, boolean> {
  const base = defaultModulesState();
  if (!raw || typeof raw !== "object") return base;
  for (const k of Object.keys(base) as EventModuleId[]) {
    const v = (raw as Record<string, unknown>)[k];
    if (typeof v === "boolean") base[k] = v;
  }
  return base;
}

export function countActiveModules(state: Record<EventModuleId, boolean>): number {
  return Object.values(state).filter(Boolean).length;
}

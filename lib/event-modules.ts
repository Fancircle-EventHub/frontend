import type { EventModuleId } from "@/constants/eventModules";
import { EVENT_MODULE_LIST, MODULE_IMPLEMENTATION } from "@/constants/eventModules";

export function defaultModulesState(): Record<EventModuleId, boolean> {
  const o = {} as Record<EventModuleId, boolean>;
  for (const m of EVENT_MODULE_LIST) {
    o[m.id] = false;
  }
  return o;
}

export function isModuleLiveImplementation(id: EventModuleId): boolean {
  return MODULE_IMPLEMENTATION[id] === "live";
}

export function mergeModulesFromApi(raw: unknown): Record<EventModuleId, boolean> {
  const base = defaultModulesState();
  if (!raw || typeof raw !== "object") return base;
  for (const k of Object.keys(base) as EventModuleId[]) {
    if (!isModuleLiveImplementation(k)) {
      base[k] = false;
      continue;
    }
    const v = (raw as Record<string, unknown>)[k];
    if (typeof v === "boolean") base[k] = v;
  }
  return base;
}

export function sanitizeModulesForSave(state: Record<EventModuleId, boolean>): Record<EventModuleId, boolean> {
  const out = { ...state };
  for (const k of Object.keys(out) as EventModuleId[]) {
    if (!isModuleLiveImplementation(k)) out[k] = false;
  }
  return out;
}

export function countActiveModules(state: Record<EventModuleId, boolean>): number {
  return Object.values(state).filter(Boolean).length;
}

export function countLiveActiveModules(state: Record<EventModuleId, boolean>): number {
  return (Object.keys(MODULE_IMPLEMENTATION) as EventModuleId[]).filter(
    (id) => isModuleLiveImplementation(id) && state[id],
  ).length;
}

export function isModuleEnabled(
  modules: Record<string, boolean> | null | undefined,
  id: EventModuleId,
): boolean {
  if (!modules) return false;
  return Boolean(modules[id]);
}

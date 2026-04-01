"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import {
  useCreateOrganizationEventExternalPromoItemMutation,
  useDeleteOrganizationEventExternalPromoItemMutation,
  useGetOrganizationEventQuery,
  useReorderOrganizationEventExternalPromoItemsMutation,
  useUpdateOrganizationEventExternalPromoItemMutation,
  useUpdateOrganizationEventMutation,
} from "@/apis/event.api";
import { extractApiErrorMessage } from "@/lib/api-error";
import { Button } from "@/components/ui/button";
import { ImageUploadField } from "@/components/organization-dashboard/ImageUploadField";
import { FieldError, inputClassName, labelClass } from "@/components/organization-auth/auth-form-primitives";
import type { EventExternalPromoItem } from "@/types/event.types";

type Props = {
  eventId: string;
};

function isValidHttpUrl(raw: string): boolean {
  const s = raw.trim();
  if (!s) return false;
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function OrganizationEventExternalPromoScreen({ eventId }: Props) {
  const { data: eventEnvelope, isLoading: evLoading } = useGetOrganizationEventQuery(eventId, { skip: !eventId });
  const [updateEvent, { isLoading: savingLabel }] = useUpdateOrganizationEventMutation();
  const [createItem, { isLoading: creating }] = useCreateOrganizationEventExternalPromoItemMutation();
  const [updateItem, { isLoading: updating }] = useUpdateOrganizationEventExternalPromoItemMutation();
  const [deleteItem, { isLoading: isDeletingItem }] = useDeleteOrganizationEventExternalPromoItemMutation();
  const [reorderItems, { isLoading: reordering }] = useReorderOrganizationEventExternalPromoItemsMutation();

  const event = eventEnvelope?.data;
  const title = event?.title ?? "Event";

  const sortedItems = useMemo(() => {
    const raw = event?.external_promo_items ?? [];
    return [...raw].sort((a, b) => a.sort_order - b.sort_order || a.id.localeCompare(b.id));
  }, [event?.external_promo_items]);

  const sectionHeadingInputRef = useRef<HTMLInputElement>(null);

  const [addTitle, setAddTitle] = useState("");
  const [addSubtitle, setAddSubtitle] = useState("");
  const [addImageKey, setAddImageKey] = useState("");
  const [addUrl, setAddUrl] = useState("");
  const [addActive, setAddActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<EventExternalPromoItem> | null>(null);

  async function saveSectionLabel() {
    if (!eventId) return;
    setFormError(null);
    const raw = sectionHeadingInputRef.current?.value ?? "";
    try {
      await updateEvent({
        eventId,
        body: { external_promo_section_label: raw.trim() || null },
      }).unwrap();
    } catch (e) {
      setFormError(extractApiErrorMessage(e));
    }
  }

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!addTitle.trim()) {
      setFormError("Title is required.");
      return;
    }
    if (!addImageKey.trim()) {
      setFormError("Image is required for the card layout.");
      return;
    }
    if (!isValidHttpUrl(addUrl)) {
      setFormError("Enter a valid external URL (https://…).");
      return;
    }
    try {
      await createItem({
        eventId,
        body: {
          title: addTitle.trim(),
          subtitle: addSubtitle.trim() || null,
          image_url: addImageKey.trim(),
          external_url: addUrl.trim(),
          is_active: addActive,
        },
      }).unwrap();
      setAddTitle("");
      setAddSubtitle("");
      setAddImageKey("");
      setAddUrl("");
      setAddActive(true);
    } catch (err) {
      setFormError(extractApiErrorMessage(err));
    }
  }

  function startEdit(m: EventExternalPromoItem) {
    setEditingId(m.id);
    setEditDraft({ ...m });
  }

  async function saveEdit() {
    if (!editingId || !editDraft) return;
    if (!editDraft.title?.trim()) {
      setFormError("Title is required.");
      return;
    }
    const original = sortedItems.find((x) => x.id === editingId);
    const img = (editDraft.image_path ?? "").trim() || (original?.image_path ?? "").trim();
    if (!img) {
      setFormError("Image is required for the card layout.");
      return;
    }
    if (!isValidHttpUrl(editDraft.external_url ?? "")) {
      setFormError("Enter a valid external URL (https://…).");
      return;
    }
    setFormError(null);
    try {
      await updateItem({
        eventId,
        itemId: editingId,
        body: {
          title: editDraft.title?.trim(),
          subtitle: editDraft.subtitle?.trim() || null,
          image_url: img,
          external_url: editDraft.external_url?.trim(),
          is_active: editDraft.is_active,
        },
      }).unwrap();
      setEditingId(null);
      setEditDraft(null);
    } catch (err) {
      setFormError(extractApiErrorMessage(err));
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Remove this recommendation link?")) return;
    setFormError(null);
    try {
      await deleteItem({ eventId, itemId: id }).unwrap();
      if (editingId === id) {
        setEditingId(null);
        setEditDraft(null);
      }
    } catch (err) {
      setFormError(extractApiErrorMessage(err));
    }
  }

  async function applyOrder(nextIds: string[]) {
    setFormError(null);
    try {
      await reorderItems({ eventId, body: { item_ids: nextIds } }).unwrap();
    } catch (err) {
      setFormError(extractApiErrorMessage(err));
    }
  }

  function moveItem(id: string, dir: -1 | 1) {
    const ids = sortedItems.map((x) => x.id);
    const idx = ids.indexOf(id);
    const j = idx + dir;
    if (idx < 0 || j < 0 || j >= ids.length) return;
    const next = [...ids];
    [next[idx], next[j]] = [next[j], next[idx]];
    void applyOrder(next);
  }

  if (!eventId) {
    return <p className="text-sm text-eh-text-secondary">Invalid event.</p>;
  }

  if (evLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-eh-text-secondary">
        <div className="flex flex-col items-center gap-3">
          <div className="size-10 animate-spin rounded-full border-2 border-eh-accent/30 border-t-eh-accent" />
          <p className="text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <Link href={`/organization/events/${eventId}/modules`} className="text-sm font-medium text-eh-accent hover:underline">
          ← Back to modules
        </Link>
      </div>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-eh-accent">Tour promotion</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-white">External links</h1>
      <p className="mt-2 text-sm text-eh-text-secondary">
        Add ticket or partner links (for example Ticketmaster) as full-width cards on the guest hub for{" "}
        <span className="text-white">{title}</span>. Guests only see this block when the tour promotion module is on and at
        least one link is active.
      </p>

      <div className="mt-8 space-y-2">
        <label className={labelClass} htmlFor="promo-section-label">
          Section heading (optional)
        </label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <input
            id="promo-section-label"
            ref={sectionHeadingInputRef}
            key={`${event?.id ?? eventId}-${event?.external_promo_section_label ?? ""}-${event?.updated_at ?? ""}`}
            defaultValue={event?.external_promo_section_label ?? ""}
            placeholder="You may also like"
            className={`${inputClassName(false)} sm:min-w-0 sm:flex-1`}
          />
          <Button
            type="button"
            variant="secondary"
            loading={savingLabel}
            className="shrink-0 px-6"
            onClick={() => void saveSectionLabel()}
          >
            Save heading
          </Button>
        </div>
        <p className="text-xs text-eh-text-tertiary">Leave blank to use the default label on the guest page.</p>
      </div>

      {formError ? (
        <div className="mt-6">
          <FieldError message={formError} />
        </div>
      ) : null}

      <form onSubmit={(e) => void onAdd(e)} className="mt-10 space-y-4 rounded-xl border border-white/10 bg-[#16181c] p-5">
        <h2 className="text-sm font-semibold text-white">Add link</h2>
        <div>
          <label className={labelClass} htmlFor="add-title">
            Title <span className="text-red-400">*</span>
          </label>
          <input
            id="add-title"
            value={addTitle}
            onChange={(e) => setAddTitle(e.target.value)}
            className={inputClassName(false)}
            required
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="add-sub">
            Subtitle
          </label>
          <input
            id="add-sub"
            value={addSubtitle}
            onChange={(e) => setAddSubtitle(e.target.value)}
            className={inputClassName(false)}
            placeholder="Optional — e.g. city or venue"
          />
        </div>
        <ImageUploadField
          id="add-img"
          label="Image"
          hint="Required — wide image works best."
          value={addImageKey}
          onChange={setAddImageKey}
          uploadType="event_external_promo_image"
          eventId={eventId}
          variant="cover"
        />
        <div>
          <label className={labelClass} htmlFor="add-url">
            External URL <span className="text-red-400">*</span>
          </label>
          <input
            id="add-url"
            type="url"
            value={addUrl}
            onChange={(e) => setAddUrl(e.target.value)}
            className={inputClassName(false)}
            placeholder="https://"
            required
          />
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-eh-text-secondary">
          <input
            type="checkbox"
            className="size-4 rounded border-white/20 bg-black/40 text-eh-accent focus:ring-eh-accent/40"
            checked={addActive}
            onChange={(e) => setAddActive(e.target.checked)}
          />
          Active
        </label>
        <Button type="submit" variant="primary" loading={creating} className="px-8">
          Add link
        </Button>
      </form>

      {sortedItems.length === 0 ? (
        <p className="mt-10 rounded-xl border border-dashed border-white/15 bg-[#16181c] p-8 text-center text-sm text-eh-text-secondary">
          No recommendation links added yet.
        </p>
      ) : (
        <ul className="mt-10 space-y-4">
          {sortedItems.map((m, pos) => (
            <li key={m.id} className="rounded-xl border border-white/10 bg-[#1a1d24]/90 p-5">
              {editingId === m.id && editDraft ? (
                <div className="space-y-4">
                  <div>
                    <label className={labelClass} htmlFor={`edit-title-${m.id}`}>
                      Title
                    </label>
                    <input
                      id={`edit-title-${m.id}`}
                      value={editDraft.title ?? ""}
                      onChange={(e) => setEditDraft((d) => ({ ...d!, title: e.target.value }))}
                      className={inputClassName(false)}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor={`edit-sub-${m.id}`}>
                      Subtitle
                    </label>
                    <input
                      id={`edit-sub-${m.id}`}
                      value={editDraft.subtitle ?? ""}
                      onChange={(e) => setEditDraft((d) => ({ ...d!, subtitle: e.target.value }))}
                      className={inputClassName(false)}
                    />
                  </div>
                  <ImageUploadField
                    id={`edit-img-${m.id}`}
                    label="Image"
                    hint="Replace or clear then upload."
                    value={(editDraft.image_path ?? "").trim() || ""}
                    onChange={(next) => setEditDraft((d) => ({ ...d!, image_path: next || null }))}
                    uploadType="event_external_promo_image"
                    eventId={eventId}
                    variant="cover"
                  />
                  <div>
                    <label className={labelClass} htmlFor={`edit-url-${m.id}`}>
                      External URL
                    </label>
                    <input
                      id={`edit-url-${m.id}`}
                      type="url"
                      value={editDraft.external_url ?? ""}
                      onChange={(e) => setEditDraft((d) => ({ ...d!, external_url: e.target.value }))}
                      className={inputClassName(false)}
                    />
                  </div>
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-eh-text-secondary">
                    <input
                      type="checkbox"
                      className="size-4 rounded border-white/20 bg-black/40 text-eh-accent focus:ring-eh-accent/40"
                      checked={Boolean(editDraft.is_active)}
                      onChange={(e) => setEditDraft((d) => ({ ...d!, is_active: e.target.checked }))}
                    />
                    Active
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="primary" loading={updating} className="px-6" onClick={() => void saveEdit()}>
                      Save
                    </Button>
                    <button
                      type="button"
                      className="text-xs text-eh-text-tertiary hover:text-white"
                      onClick={() => {
                        setEditingId(null);
                        setEditDraft(null);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">{m.title}</p>
                    {m.subtitle ? (
                      <p className="mt-1 text-xs text-eh-text-tertiary">{m.subtitle}</p>
                    ) : (
                      <p className="mt-1 text-xs italic text-eh-text-tertiary">No subtitle</p>
                    )}
                    <p className="mt-2 break-all text-xs text-eh-accent">{m.external_url}</p>
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-eh-text-tertiary">
                      {m.is_active ? "Active" : "Hidden"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    <button
                      type="button"
                      className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-eh-text-secondary hover:border-white/30 hover:text-white disabled:opacity-40"
                      disabled={reordering || pos === 0}
                      onClick={() => moveItem(m.id, -1)}
                    >
                      Up
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-eh-text-secondary hover:border-white/30 hover:text-white disabled:opacity-40"
                      disabled={reordering || pos >= sortedItems.length - 1}
                      onClick={() => moveItem(m.id, 1)}
                    >
                      Down
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-eh-text-secondary hover:border-white/30 hover:text-white"
                      onClick={() => startEdit(m)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs text-red-300 hover:border-red-400 disabled:opacity-40"
                      disabled={isDeletingItem}
                      onClick={() => void onDelete(m.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

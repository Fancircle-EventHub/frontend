"use client";

import { useState } from "react";
import {
  useCreateOrganizationEventNotificationMutation,
  useDeleteOrganizationEventNotificationMutation,
  useOrganizationEventNotificationsQuery,
  useUpdateOrganizationEventNotificationMutation,
} from "@/apis/event.api";
import { FieldError, inputClassName, labelClass } from "@/components/organization-auth/auth-form-primitives";
import type { NotificationAccentId, OrganizationEventNotificationItem } from "@/types/event-notification.types";
import { extractApiErrorMessage } from "@/lib/api-error";
import { NOTIFICATION_ACCENT_OPTIONS, notificationCardBorderClass, notificationSwatchClass } from "@/lib/notification-accent";
import { Button } from "@/components/ui/button";

type Props = {
  eventId: string;
};

function AccentPicker({
  value,
  onChange,
  idPrefix,
}: {
  value: NotificationAccentId;
  onChange: (v: NotificationAccentId) => void;
  idPrefix: string;
}) {
  return (
    <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="Accent color">
      {NOTIFICATION_ACCENT_OPTIONS.map((opt) => {
        const selected = value === opt.id;
        const inputId = `${idPrefix}-${opt.id}`;
        return (
          <label
            key={opt.id}
            htmlFor={inputId}
            className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border px-2 py-2 transition ${
              selected ? "border-eh-accent bg-eh-accent/10" : "border-white/10 hover:border-white/20"
            }`}
          >
            <input
              id={inputId}
              type="radio"
              name={`${idPrefix}-accent`}
              className="sr-only"
              checked={selected}
              onChange={() => onChange(opt.id)}
            />
            <span className={`size-6 rounded-full ring-2 ring-white/20 ${notificationSwatchClass(opt.id)}`} aria-hidden />
            <span className="text-[10px] font-semibold uppercase tracking-wide text-eh-text-tertiary">{opt.label}</span>
          </label>
        );
      })}
    </div>
  );
}

export function OrganizationEventNotificationsScreen({ eventId }: Props) {
  const { data, isLoading, isError, refetch } = useOrganizationEventNotificationsQuery(eventId, { skip: !eventId });
  const [createN, { isLoading: creating }] = useCreateOrganizationEventNotificationMutation();
  const [updateN, { isLoading: updating }] = useUpdateOrganizationEventNotificationMutation();
  const [deleteN, { isLoading: deleting }] = useDeleteOrganizationEventNotificationMutation();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("");
  const [accent, setAccent] = useState<NotificationAccentId>("amber");
  const [formError, setFormError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<OrganizationEventNotificationItem> | null>(null);

  const busy = creating || updating || deleting;
  const list = data?.data?.notifications ?? [];

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!title.trim() || !body.trim()) {
      setFormError("Title and message are required.");
      return;
    }
    try {
      await createN({
        eventId,
        body: {
          title: title.trim(),
          body: body.trim(),
          category: category.trim() || null,
          color: accent,
        },
      }).unwrap();
      setTitle("");
      setBody("");
      setCategory("");
      setAccent("amber");
    } catch (err) {
      setFormError(extractApiErrorMessage(err));
    }
  }

  function startEdit(n: OrganizationEventNotificationItem) {
    setEditingId(n.id);
    setEditDraft({ ...n, color: n.color ?? "amber" });
  }

  async function saveEdit() {
    if (!editingId || !editDraft?.title?.trim() || !editDraft?.body?.trim()) return;
    try {
      await updateN({
        eventId,
        notificationId: editingId,
        body: {
          title: editDraft.title.trim(),
          body: editDraft.body.trim(),
          category: editDraft.category?.trim() || null,
          color: editDraft.color ?? "amber",
        },
      }).unwrap();
      setEditingId(null);
      setEditDraft(null);
    } catch (err) {
      alert(extractApiErrorMessage(err));
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this announcement?")) return;
    try {
      await deleteN({ eventId, notificationId: id }).unwrap();
    } catch (err) {
      alert(extractApiErrorMessage(err));
    }
  }

  if (!eventId) {
    return <p className="text-sm text-eh-text-secondary">Invalid event.</p>;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-eh-text-secondary">
        <div className="size-10 animate-spin rounded-full border-2 border-eh-accent/30 border-t-eh-accent" />
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="rounded-xl border border-white/10 bg-[#0e1012] p-6 text-center">
        <p className="text-sm text-eh-text-secondary">Could not load announcements.</p>
        <Button type="button" variant="secondary" className="mt-4 px-8" onClick={() => void refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-eh-accent">Updates</p>
        <h1 className="mt-2 text-2xl font-bold text-white">Event announcements</h1>
        <p className="mt-2 text-sm text-eh-text-secondary">
          Short updates shown in the guest hub when Notifications is enabled. Pick a border color so important items stand out.
        </p>
      </div>

      <form onSubmit={(e) => void onCreate(e)} className="rounded-xl border border-white/10 bg-[#16181c] p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-white">New announcement</h2>
        <div className="mt-4 space-y-3">
          <div>
            <label className={labelClass} htmlFor="n-title">
              Title
            </label>
            <input
              id="n-title"
              className={inputClassName(false)}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Headline"
              required
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="n-body">
              Message
            </label>
            <textarea
              id="n-body"
              rows={4}
              className={`${inputClassName(false)} min-h-[100px] resize-y`}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="What guests should know"
              required
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="n-cat">
              Category (optional)
            </label>
            <input
              id="n-cat"
              className={inputClassName(false)}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. logistics, safety"
            />
          </div>
          <div>
            <p className={labelClass}>Border color</p>
            <AccentPicker idPrefix="new" value={accent} onChange={setAccent} />
          </div>
          <FieldError message={formError ?? undefined} />
          <Button type="submit" disabled={busy} className="min-w-[10.5rem] px-10 sm:px-14">
            {creating ? "Publishing…" : "Publish"}
          </Button>
        </div>
      </form>

      <section>
        <h2 className="text-sm font-semibold text-white">Published</h2>
        {list.length === 0 ? (
          <p className="mt-3 text-sm text-eh-text-tertiary">No announcements yet.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {list.map((n) => (
              <li key={n.id} className={`rounded-xl p-4 ${notificationCardBorderClass(n.color)} bg-[#0e1012]`}>
                {editingId === n.id && editDraft ? (
                  <div className="space-y-3">
                    <input
                      className={inputClassName(false)}
                      value={editDraft.title ?? ""}
                      onChange={(e) => setEditDraft((d) => ({ ...d!, title: e.target.value }))}
                    />
                    <textarea
                      className={`${inputClassName(false)} min-h-[80px]`}
                      value={editDraft.body ?? ""}
                      onChange={(e) => setEditDraft((d) => ({ ...d!, body: e.target.value }))}
                    />
                    <input
                      className={inputClassName(false)}
                      value={editDraft.category ?? ""}
                      onChange={(e) => setEditDraft((d) => ({ ...d!, category: e.target.value }))}
                      placeholder="Category"
                    />
                    <div>
                      <p className={labelClass}>Border color</p>
                      <AccentPicker
                        idPrefix={`edit-${n.id}`}
                        value={(editDraft.color ?? "amber") as NotificationAccentId}
                        onChange={(v) => setEditDraft((d) => ({ ...d!, color: v }))}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" className="min-h-[42px] px-6" onClick={() => void saveEdit()} disabled={busy}>
                        Save
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        className="min-h-[42px] px-6"
                        onClick={() => {
                          setEditingId(null);
                          setEditDraft(null);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-eh-text-tertiary">
                          {n.created_at?.slice(0, 10) ?? "—"}
                          {n.category ? ` · ${n.category}` : ""}
                        </p>
                        <p className="mt-1 font-semibold text-white">{n.title}</p>
                        <p className="mt-2 whitespace-pre-wrap text-sm text-eh-text-secondary">{n.body}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button type="button" variant="secondary" className="min-h-[42px] px-6" onClick={() => startEdit(n)}>
                        Edit
                      </Button>
                      <Button type="button" variant="secondary" className="min-h-[42px] px-6" onClick={() => void remove(n.id)}>
                        Delete
                      </Button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

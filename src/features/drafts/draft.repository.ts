import { ContentDraftBase, ContentStatus } from "@/types/content";

export const draftRepository = {
  async getAll(): Promise<ContentDraftBase[]> {
    const response = await fetch("/api/drafts");
    const result = (await response.json()) as { drafts?: ContentDraftBase[]; message?: string };

    if (!response.ok) {
      throw new Error(result.message || "Gagal memuat draft.");
    }

    return result.drafts || [];
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`/api/drafts/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const result = (await response.json()) as { message?: string };
      throw new Error(result.message || "Gagal menghapus draft.");
    }
  },

  async duplicate(id: string): Promise<void> {
    const response = await fetch(`/api/drafts/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "duplicate" }),
    });

    if (!response.ok) {
      const result = (await response.json()) as { message?: string };
      throw new Error(result.message || "Gagal menduplikasi draft.");
    }
  },

  async updateStatus(id: string, status: ContentStatus): Promise<void> {
    await patchDraft(id, { status });
  },

  async updateScheduledAt(id: string, scheduledAt: string | undefined): Promise<void> {
    await patchDraft(id, { scheduledAt: scheduledAt || null });
  },

  async updateNotes(id: string, notes: string): Promise<void> {
    await patchDraft(id, { notes });
  }
};

async function patchDraft(id: string, payload: Record<string, unknown>) {
  const response = await fetch(`/api/drafts/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const result = (await response.json()) as { message?: string };
    throw new Error(result.message || "Gagal memperbarui draft.");
  }
}

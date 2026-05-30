import { ReelsDraft } from "@/types/reels";

export const reelsRepository = {
  async save(draft: ReelsDraft): Promise<void> {
    const response = await fetch("/api/drafts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(draft),
    });

    if (!response.ok) {
      const result = (await response.json()) as { message?: string };
      throw new Error(result.message || "Gagal menyimpan draft reels.");
    }
  },

  async getById(id: string): Promise<ReelsDraft | undefined> {
    const response = await fetch(`/api/drafts/${encodeURIComponent(id)}`);

    if (response.status === 404) return undefined;

    const result = (await response.json()) as { draft?: ReelsDraft; message?: string };

    if (!response.ok) {
      throw new Error(result.message || "Gagal memuat draft reels.");
    }

    const draft = result.draft;
    if (draft?.format === "reels") {
      return draft;
    }
    return undefined;
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`/api/drafts/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const result = (await response.json()) as { message?: string };
      throw new Error(result.message || "Gagal menghapus draft reels.");
    }
  }
};

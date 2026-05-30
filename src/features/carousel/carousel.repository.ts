import { CarouselDraft } from "@/types/carousel";

export const carouselRepository = {
  async save(draft: CarouselDraft): Promise<void> {
    const response = await fetch("/api/drafts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(draft),
    });

    if (!response.ok) {
      const result = (await response.json()) as { message?: string };
      throw new Error(result.message || "Gagal menyimpan draft carousel.");
    }
  },

  async getById(id: string): Promise<CarouselDraft | undefined> {
    const response = await fetch(`/api/drafts/${encodeURIComponent(id)}`);

    if (response.status === 404) return undefined;

    const result = (await response.json()) as { draft?: CarouselDraft; message?: string };

    if (!response.ok) {
      throw new Error(result.message || "Gagal memuat draft carousel.");
    }

    const draft = result.draft;
    if (draft?.format === "carousel") {
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
      throw new Error(result.message || "Gagal menghapus draft carousel.");
    }
  }
};

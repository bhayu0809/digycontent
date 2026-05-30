import { BrandProfile } from '@/types/brand';

export const brandRepository = {
  async getProfile(id: string = 'default'): Promise<BrandProfile | null> {
    const response = await fetch(`/api/brand?id=${encodeURIComponent(id)}`);
    const result = (await response.json()) as { profile?: BrandProfile | null; message?: string };

    if (!response.ok) {
      throw new Error(result.message || 'Gagal memuat Brand Brain.');
    }

    return result.profile || null;
  },

  async saveProfile(profile: BrandProfile): Promise<void> {
    const response = await fetch('/api/brand', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profile),
    });

    if (!response.ok) {
      const result = (await response.json()) as { message?: string };
      throw new Error(result.message || 'Gagal menyimpan Brand Brain.');
    }
  },

  getDefaultTemplate(): BrandProfile {
    return {
      id: 'default',
      name: 'DigytaLab',
      positioning: 'Bukan template asal jadi. DigytaLab membantu bisnis lokal dan lembaga pendidikan punya website custom/brand-adjusted dengan katalog rapi, SEO Basic, CTA WhatsApp, dan alur customer yang lebih mudah dipahami.',
      targetAudience: 'Pemilik bisnis lokal dan decision maker lembaga pendidikan yang sudah berjalan 6-12 bulan, punya customer, aktif di Google Maps/Instagram/WhatsApp, tetapi belum punya website yang meyakinkan atau alur customer yang rapi. Prioritas: salon/barbershop/beauty clinic, bimbel/kursus/sekolah swasta kecil, printing/custom merchandise, catering/bakery preorder.',
      offers: [
        'Website Profil Rp1.499.000/tahun: profil resmi 1 halaman, domain/hosting/SSL, layout standar DigytaLab yang disesuaikan ringan, katalog 5-8 item, WA button, Maps, social links, SEO Basic 1 halaman, 1 revisi ringan, 2 update konten/tahun.',
        'Bisnis Web Custom Rp5.500.000/tahun, renewal Rp4.500.000: desain diarahkan custom, sampai 6 halaman, katalog/kategori, WA auto-text, form inquiry ringan, SEO Basic halaman penting, 2 ronde revisi, 8 update konten/tahun.',
        'Custom Flow via WhatsApp: booking, order, request quote, PPDB, dashboard, atau flow khusus lain yang didiagnosis dulu via WhatsApp tanpa harga fix publik.',
        'Care Plan: Care Web 500rb/bulan, Care System 900rb/bulan, Care Priority 1,5jt/bulan untuk update, monitoring, backup, dan support.',
      ],
      toneOfVoice: 'Santai, jelas, edukatif, sedikit menohok, tidak terlalu teknis, tidak sok korporat.',
      mainMessage: 'Website DigytaLab disusun dari tampilan, katalog, CTA WhatsApp, dan SEO Basic agar customer lebih mudah percaya dan mengambil aksi tanpa owner harus pusing urusan teknis.',
      cta: 'Mau dibantu rapihin alur digital bisnis kamu? Chat DigytaLab.',
      contentRules: [
        'Mulai dari diagnosis tampilan dan alur customer, bukan hard selling "mau bikin website?".',
        'Hubungkan konten ke website, katalog, CTA WhatsApp, SEO Basic realistis, revisi/update, Custom Flow, PPDB, atau care setelah website live.',
        'Edukasi perbedaan Instagram, Google Maps, WhatsApp, dan website dengan bahasa sederhana.',
        'Gunakan contoh bisnis lokal dan lembaga pendidikan yang konkret.',
      ],
      forbiddenStyles: [
        'Jangan janji ranking Google halaman 1.',
        'Jangan klaim unlimited revisi, unlimited update, atau unlimited development.',
        'Jangan beri harga fix untuk Custom Flow; arahkan ke diagnosis via WhatsApp.',
        'Jangan menyerang WordPress; posisikan DigytaLab sebagai pilihan untuk owner yang ingin alur rapi tanpa repot teknis.',
        'Jangan buat konten digital marketing generik yang tidak nyambung ke website dan alur customer DigytaLab.',
      ],
      updatedAt: new Date().toISOString(),
    };
  }
};

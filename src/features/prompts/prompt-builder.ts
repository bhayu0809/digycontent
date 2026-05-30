import { BrandProfile } from "@/types/brand";

export type DailyIdeaPromptInput = {
  postingDate: string;
  targetBusiness?: string;
  contentTitle?: string;
  audienceFocus?: "umkm" | "education";
  formatMode?: "mixed" | "carousel" | "reels";
  carouselSlideCount?: number;
  existingIdeaSummaries?: string[];
};

export const DIGYTALAB_IMAGE_STYLE = `Use Digytalab visual DNA from digytalab.com: modern clean website/tech studio aesthetic for Indonesian local businesses and UMKM. Color palette must use Digytalab purple as the main accent (#673DE6), deeper purple for emphasis (#4F17CE), soft warm surface backgrounds (#FAF9FB / #F5F3F5 / #EFEDF0), crisp white cards (#FFFFFF), foreground near-black (#1B1C1E), muted copy color (#484455), and a small WhatsApp green accent (#25D366) only when relevant. Use rounded website cards, phone or laptop UI mockups, subtle shadows, simple 3D/vector editorial illustration, professional but friendly mood, spacious composition, 4:5 Instagram carousel ratio, no random neon colors, no amber/yellow brand accents, no text rendered inside the image unless explicitly requested. Leave clean negative space so the app can overlay headline/body text.`;

export const DIGYTALAB_STRATEGY_SCOPE = `Scope strategi DigytaLab:
- Positioning utama: bukan template asal jadi. DigytaLab membantu bisnis lokal dan lembaga pendidikan punya website custom/brand-adjusted yang rapi, SEO Basic, katalog jelas, CTA WhatsApp, dan flow customer untuk chat, inquiry, booking, order, request quote, PPDB, atau dashboard jika memang masuk Custom Flow.
- Paket yang boleh disebut:
  1. Website Profil: Rp1.499.000/tahun untuk profil resmi 1 halaman, domain/hosting/SSL, layout standar DigytaLab yang disesuaikan ringan, katalog 5-8 item, WhatsApp button, Maps, social links, SEO Basic 1 halaman, 1 revisi ringan, 2 update konten/tahun.
  2. Bisnis Web Custom: Rp5.500.000/tahun, renewal Rp4.500.000, desain diarahkan custom, sampai 6 halaman, katalog/kategori, WA auto-text, form inquiry ringan, SEO Basic halaman penting, 2 ronde revisi, 8 update konten/tahun.
  3. Custom Flow via WhatsApp: booking, order, request quote, PPDB, dashboard, atau flow khusus lain. Jangan beri harga fix; arahkan ke diagnosis via WhatsApp.
  4. Care Plan: Care Web 500rb/bulan, Care System 900rb/bulan, Care Priority 1,5jt/bulan untuk update, monitoring, backup, dan support. Bukan unlimited development.
- Target prioritas 30 hari: beauty/salon/barbershop/beauty clinic, bimbel/kursus/sekolah swasta kecil, printing/custom merchandise, catering/bakery preorder. Target tambahan boleh: workshop/detailing/carwash, wedding/event/decor, cafe/resto secara selektif.
- Pain point utama: info bisnis tersebar di IG/WA/Maps, customer tanya hal berulang, katalog/harga/lokasi belum rapi, kepercayaan dari Google lemah, admin masih manual untuk chat/order/booking/PPDB.
- Angle konten utama: diagnosis tampilan dan alur customer, beda fungsi Instagram vs website, katalog rapi, CTA WhatsApp, SEO Basic realistis, batas scope paket, revisi vs update konten, before-after alur customer, PPDB/inquiry sekolah, care setelah website live.
- Cara jualan: mulai dari cek gratis/diagnosis tampilan dan alur digital, bukan hard selling "mau bikin website?". Soft selling boleh mengarah ke chat WA.
- Guardrail klaim: jangan janji ranking Google halaman 1, jangan bilang unlimited revisi/update, jangan memberi harga fix untuk Custom Flow, jangan menyerang WordPress, jangan menjual website template murah, jangan membuat ide konten digital marketing generik yang tidak nyambung ke website/alur customer DigytaLab.`;

export function buildDigytalabImagePrompt(imagePrompt: string): string {
  if (imagePrompt.includes("Digytalab visual DNA")) {
    return imagePrompt;
  }

  return `${imagePrompt.trim()}

${DIGYTALAB_IMAGE_STYLE}`;
}

export function buildCarouselImageBatchPrompt(title: string, slides: Array<{ headline: string; body: string; imagePrompt: string }>): string {
  const slidePrompts = slides.map((slide, index) => {
    return `Slide ${index + 1}
Headline context: ${slide.headline}
Body context: ${slide.body}
Image direction: ${slide.imagePrompt}`;
  }).join("\n\n");

  return `Generate ${slides.length} separate images for an Instagram carousel titled "${title}".

Each image must match the same Digytalab brand visual system and feel like one cohesive carousel set.
Return the images as separate outputs in the same order as the slide list.
Do not render the headline/body text into the image; leave negative space for text overlay in the app.

${DIGYTALAB_IMAGE_STYLE}

Slide list:
${slidePrompts}`;
}

export function buildSystemPrompt(brand: BrandProfile): string {
  const brandOffers = brand.offers || [];
  const brandContentRules = brand.contentRules || [];
  const brandForbiddenStyles = brand.forbiddenStyles || [];
  const offers = brandOffers.length > 0 ? brandOffers.join("; ") : "Website Profil, Bisnis Web Custom, Custom Flow via WhatsApp, dan Care Plan.";
  const contentRules = brandContentRules.length > 0 ? brandContentRules.join("; ") : "Mulai dari diagnosis alur customer, edukatif, soft selling, dan tetap jelas soal scope paket.";
  const forbiddenStyles = brandForbiddenStyles.length > 0 ? brandForbiddenStyles.join("; ") : "Janji ranking SEO, unlimited revisi/update, harga fix Custom Flow, hard selling template murah, atau konten digital marketing generik.";

  return `Kamu adalah social media strategist dan copywriter ahli untuk brand berikut:
Brand Name: ${brand.name}
Positioning: ${brand.positioning}
Target Audience: ${brand.targetAudience}
Offers: ${offers}
Tone of Voice: ${brand.toneOfVoice}
Main Message: ${brand.mainMessage || "Website yang rapi secara tampilan, katalog, CTA WhatsApp, dan SEO Basic agar customer lebih mudah percaya dan mengambil aksi."}
CTA Utama: ${brand.cta}
Content Rules: ${contentRules}
Forbidden Styles: ${forbiddenStyles}

${DIGYTALAB_STRATEGY_SCOPE}

Tugasmu adalah membuat konten yang relevan, menohok, edukatif, dan sesuai dengan identitas brand di atas.`;
}

export function buildDailyIdeasPrompt(input: DailyIdeaPromptInput, brand: BrandProfile): string {
  const targetLine = input.targetBusiness?.trim()
    ? `Target bisnis spesifik hari ini: ${input.targetBusiness}`
    : `Pilih sendiri target bisnis paling relevan dari target audience brand.`;
  const titleLine = input.contentTitle?.trim()
    ? `Judul/topik manual dari user: "${input.contentTitle}". Gunakan ini sebagai arah utama konten. AI tetap boleh memperbaiki wording judul agar lebih kuat, tapi jangan mengganti topiknya.`
    : "Tidak ada judul manual. Pilih sendiri judul dan angle paling relevan.";
  const audienceFocus = input.audienceFocus || "umkm";
  const audienceLine = audienceFocus === "education"
    ? "Fokus target: pendidikan. Boleh buat konten untuk bimbel, kursus, sekolah swasta kecil, PPDB, inquiry siswa, dan alur follow-up admin."
    : "Fokus target: UMKM. Prioritaskan bisnis lokal seperti salon/barbershop/beauty clinic, printing/custom merchandise, catering/bakery preorder, workshop/detailing/carwash, wedding/event/decor, cafe/resto selektif. Jangan buat angle pendidikan kecuali user menulis target pendidikan secara eksplisit.";
  const formatMode = input.formatMode || "mixed";
  const slideCount = input.carouselSlideCount || 6;
  const formatLine = formatMode === "carousel"
    ? `Format wajib: semua 3 ide harus carousel. Setiap carousel wajib tepat ${slideCount} slide.`
    : formatMode === "reels"
      ? "Format wajib: semua 3 ide harus reels. Jangan membuat carousel."
      : `Format wajib: campuran carousel dan reels. Minimal ada 1 carousel dan 1 reels. Setiap carousel wajib tepat ${slideCount} slide.`;
  const existingIdeas = input.existingIdeaSummaries?.filter(Boolean).slice(0, 120) || [];
  const existingIdeasSection = existingIdeas.length > 0
    ? `\nIde yang sudah pernah dibuat dan WAJIB DIHINDARI:\n${existingIdeas.map((idea, index) => `${index + 1}. ${idea}`).join("\n")}\n`
    : "";

  return `${buildSystemPrompt(brand)}

Buatkan 3 IDE KONTEN INSTAGRAM untuk dipost pada tanggal ${input.postingDate}.
Kalau user memberi judul/topik manual, kamu mengembangkan isinya. Kalau tidak, kamu memilih sendiri angle yang paling relevan untuk DigytaLab.
${existingIdeasSection}

Konteks tambahan:
- ${targetLine}
- ${titleLine}
- ${audienceLine}
- ${formatLine}
- Fokus konten: edukasi praktis, pain-point target terpilih, diagnosis tampilan dan alur customer, soft selling jasa website DigytaLab.
- Semua ide baru wajib unik dari daftar ide yang sudah pernah dibuat. Jangan ulangi judul, hook, pain point, package angle, target bisnis, atau struktur angle yang sama hanya dengan wording berbeda.
- Kalau target bisnis sama dengan ide lama, sudut pandang harus benar-benar baru dan pain point-nya berbeda.
- Pilih target dari fokus target di atas bila target bisnis tidak diisi. Untuk UMKM, jangan pilih bimbel/kursus/sekolah. Untuk pendidikan, jangan pakai contoh UMKM kecuali relevan sebagai pembanding.
- Setiap ide wajib punya angle yang terhubung ke salah satu paket: Website Profil, Bisnis Web Custom, Custom Flow via WhatsApp, atau Care Plan.
- Setiap ide wajib mengangkat pain point nyata: info tersebar, customer tanya berulang, katalog/harga/lokasi tidak rapi, credibility Google lemah, chat/order/booking/PPDB masih manual.
- Hindari ide generik seperti "pentingnya digital marketing" tanpa hubungan ke website, katalog, CTA WhatsApp, SEO Basic, atau flow customer.
- Jangan klaim SEO ranking halaman 1, jangan menjanjikan unlimited revisi/update, jangan memberi harga fix untuk Custom Flow, dan jangan menyerang WordPress.
- Semua image_prompt wajib mengikuti Digytalab visual DNA ini: purple #673DE6 accent, deeper purple #4F17CE, soft warm surfaces #FAF9FB/#F5F3F5/#EFEDF0, white cards, near-black foreground #1B1C1E, muted copy #484455, small WhatsApp green accent only when relevant, clean modern website/phone UI mockup, UMKM/local business context, rounded cards, soft shadows, no rendered text, 4:5 Instagram ratio.
- Berikan musicSuggestion untuk setiap ide. Jangan sebut lagu spesifik yang belum tentu tersedia. Rekomendasikan mood audio Instagram yang mudah dicari, misalnya "lo-fi upbeat", "soft tech beat", "warm acoustic beat", "clean corporate pop", atau "light motivational instrumental". Sertakan instruksi singkat volume jika ada voiceover.

Berikan output HANYA JSON valid tanpa markdown, tanpa penjelasan, dan tanpa teks lain.
Gunakan struktur persis seperti ini:

{
  "ideas": [
    {
      "format": "carousel",
      "title": "Judul internal konten",
      "pillar": "Diagnosis Alur Customer",
      "targetBusiness": "Pemilik salon",
      "industry": "Beauty/salon",
      "packageAngle": "Website Profil",
      "painPoint": "Customer sering tanya layanan, lokasi, dan harga lewat chat karena info belum rapi",
      "strategyReason": "Masuk target prioritas dan cocok untuk edukasi katalog, Maps, WA button, dan SEO Basic tanpa flow kompleks",
      "slides": [
        {
          "headline": "Maks 5 kata",
          "body": "Maks 18 kata",
          "image_prompt": "English image prompt for this slide using Digytalab visual DNA"
        }
      ],
      "caption": "Caption Instagram lengkap",
      "hashtags": ["#umkm", "#digitalisasi"],
      "cta": "${brand.cta}",
      "musicSuggestion": "lo-fi upbeat, volume 8-12% di bawah voiceover"
    },
    {
      "format": "reels",
      "title": "Judul internal reels",
      "pillar": "Pain Point",
      "targetBusiness": "Pemilik bimbel",
      "industry": "Education",
      "packageAngle": "Custom Flow via WhatsApp",
      "painPoint": "Inquiry PPDB masih masuk chat manual dan follow-up admin tercecer",
      "strategyReason": "Masuk scope lembaga pendidikan kecil dan perlu diarahkan ke diagnosis flow, bukan harga fix",
      "hook": "Hook pembuka yang menohok",
      "scenes": [
        {
          "duration": "0-3s",
          "visual": "Arah visual/B-roll",
          "text_overlay": "Teks layar",
          "voiceover": "Voiceover",
          "image_prompt": "English image/video prompt using Digytalab visual DNA"
        }
      ],
      "caption": "Caption Instagram lengkap",
      "hashtags": ["#umkm", "#bisnislokal"],
      "cta": "${brand.cta}",
      "musicSuggestion": "soft tech beat, volume 5-10% karena ada voiceover"
    }
  ]
}`;
}

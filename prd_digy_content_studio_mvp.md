# PRD — DigyContent Studio MVP

## 1. Ringkasan Produk

**Nama produk:** DigyContent Studio  
**Tipe produk:** Internal content production tool  
**Target pengguna awal:** Bayu / tim internal DigytaLab  
**Platform:** Web app berbasis Next.js  
**AI workflow:** ChatGPT Plus manual-in-the-loop  
**Tujuan utama:** Membantu membuat konten Instagram DigytaLab dari ide kosong menjadi materi siap upload, terutama carousel dan reels script.

DigyContent Studio bukan Canva, bukan social media scheduler, dan bukan AI SaaS penuh. MVP ini fokus pada workflow sederhana:

```text
Brand Brain → Generate Prompt → Copy ke ChatGPT → Paste JSON → Edit Konten → Tambah Gambar → Export Carousel/Reels Script
```

Produk ini dibuat untuk mempercepat produksi konten DigytaLab tanpa biaya API tambahan di fase awal.

---

## 2. Problem Statement

Saat membuat konten Instagram untuk DigytaLab, prosesnya masih tersebar:

- Ide konten dibuat manual atau spontan.
- Prompt ChatGPT belum konsisten.
- Hasil ChatGPT sering perlu dirapikan ulang.
- Struktur carousel/reels belum punya format tetap.
- Prompt gambar belum terdokumentasi per slide.
- Export carousel masih perlu alat desain terpisah.
- Belum ada tempat menyimpan draft, status, dan rencana posting.

Akibatnya, produksi konten jadi lambat, tidak konsisten, dan sulit diulang.

---

## 3. Goals

### 3.1 Business Goals

- Mempercepat produksi konten Instagram DigytaLab.
- Menjaga positioning DigytaLab tetap konsisten.
- Membuat konten edukatif, soft selling, dan pain-point driven untuk UMKM.
- Membantu validasi angle konten sebelum membuat produk yang lebih besar.

### 3.2 Product Goals

- User bisa menyimpan Brand Brain DigytaLab.
- User bisa membuat prompt konten yang rapi untuk ChatGPT Plus.
- User bisa paste hasil JSON dari ChatGPT ke aplikasi.
- User bisa mengedit carousel slide langsung di aplikasi.
- User bisa membuat dan menyimpan prompt gambar per slide.
- User bisa upload gambar hasil generate dari ChatGPT.
- User bisa export carousel menjadi PNG/ZIP.
- User bisa menyimpan draft dan status konten.

### 3.3 Technical Goals

- Menggunakan Next.js + TypeScript.
- Bisa jalan lokal tanpa backend server di fase MVP.
- Data tersimpan lokal menggunakan IndexedDB.
- Struktur kode mudah ditrace.
- Clean code sederhana, tidak over-engineered.
- Menghindari nested if berlebihan.
- Menghindari fungsi terlalu kecil yang tersebar ke banyak file tanpa alasan kuat.
- Menggunakan functional coding style yang tetap mudah dibaca.

---

## 4. Non-Goals MVP

Fitur berikut tidak masuk MVP:

- Auto publish ke Instagram.
- Integrasi Instagram API.
- Generate image otomatis via API.
- Generate video otomatis.
- Canva-like drag-and-drop editor.
- Multi-user workspace.
- Login/authentication.
- Payment/subscription.
- Analytics Instagram otomatis.
- Template marketplace.
- AI API langsung dari aplikasi.

---

## 5. User Persona

### Primary User

**Nama:** Bayu  
**Role:** Backend programmer / owner DigytaLab  
**Kebutuhan:** Membuat konten Instagram DigytaLab dengan cepat, rapi, dan konsisten.  
**Pain point:** Ide konten dan copy bisa dibuat dengan ChatGPT, tapi workflow belum tertata dan output belum langsung siap pakai.

---

## 6. Core User Journey

### 6.1 Carousel Journey

```text
1. User membuka dashboard.
2. User memilih menu Carousel.
3. User memilih target bisnis, pillar, dan topik konten.
4. App membuat prompt carousel untuk ChatGPT.
5. User copy prompt ke ChatGPT Plus.
6. ChatGPT menghasilkan JSON carousel.
7. User paste JSON ke aplikasi.
8. App memvalidasi JSON.
9. App menampilkan carousel preview.
10. User mengedit headline, body, caption, CTA, dan hashtag.
11. User copy image prompt per slide ke ChatGPT Plus.
12. User upload gambar hasil generate ke tiap slide.
13. User export semua slide menjadi PNG/ZIP.
14. User menyimpan draft sebagai Ready atau Posted.
```

### 6.2 Reels Script Journey

```text
1. User membuka menu Reels.
2. User memilih target bisnis, pillar, dan topik.
3. App membuat prompt reels script untuk ChatGPT.
4. User copy prompt ke ChatGPT Plus.
5. User paste hasil JSON reels ke aplikasi.
6. App menampilkan scene breakdown.
7. User mengedit hook, voiceover, text overlay, caption, CTA, dan hashtag.
8. User menyimpan reels script sebagai draft.
9. User menggunakan script untuk produksi manual di CapCut/Instagram.
```

---

## 7. Information Architecture

```text
Dashboard
├── Brand Brain
├── Content Ideas
├── Carousel Studio
├── Reels Studio
├── Draft Library
└── Content Calendar
```

### 7.1 Dashboard

Menampilkan ringkasan:

- Total draft.
- Draft carousel.
- Draft reels.
- Konten ready.
- Konten posted.
- Shortcut buat carousel baru.
- Shortcut buat reels baru.

### 7.2 Brand Brain

Menyimpan informasi dasar DigytaLab:

- Brand name.
- Positioning.
- Target audience.
- Services/offers.
- Tone of voice.
- CTA utama.
- Content rules.
- Forbidden style.

### 7.3 Content Ideas

Membantu membuat prompt ide konten:

- Target bisnis.
- Content pillar.
- Goal konten.
- Format konten.
- Jumlah ide.

### 7.4 Carousel Studio

Fitur utama untuk membuat carousel:

- Form topik.
- Prompt generator.
- JSON paste/import.
- Slide editor.
- Image prompt manager.
- Image upload.
- Preview 1080x1350.
- Export PNG/ZIP.

### 7.5 Reels Studio

Fitur untuk membuat reels script:

- Form topik.
- Prompt generator.
- JSON paste/import.
- Scene editor.
- Hook editor.
- Voiceover editor.
- Text overlay editor.
- Caption editor.

### 7.6 Draft Library

Tempat melihat semua draft:

- Search.
- Filter by format.
- Filter by status.
- Filter by pillar.
- Edit draft.
- Duplicate draft.
- Delete draft.

### 7.7 Content Calendar

Calendar sederhana untuk planning:

- Tanggal rencana post.
- Status konten.
- Format.
- Pillar.
- Catatan performa manual.

---

## 8. Feature Requirements

## 8.1 Brand Brain

### Description

Brand Brain adalah preset identitas DigytaLab yang dipakai untuk membuat prompt.

### Fields

```ts
type BrandProfile = {
  id: string;
  name: string;
  positioning: string;
  targetAudience: string;
  offers: string[];
  toneOfVoice: string;
  mainMessage: string;
  cta: string;
  contentRules: string[];
  forbiddenStyles: string[];
  updatedAt: string;
};
```

### Default Value

```text
Brand: DigytaLab
Positioning: Membantu UMKM dan bisnis lokal punya sistem digital yang lebih rapi, mulai dari website, katalog digital, form order/booking, WhatsApp flow, dan landing page yang siap dipakai jualan.
Target: Pemilik cafe, resto kecil, salon, klinik, bengkel, katering, laundry, jasa lokal, dan UMKM yang masih mengandalkan chat manual.
Tone: Santai, jelas, edukatif, sedikit menohok, tidak terlalu teknis, tidak sok korporat.
CTA: Mau dibantu rapihin alur digital bisnis kamu? Chat DigytaLab.
```

### Acceptance Criteria

- User bisa melihat Brand Brain default.
- User bisa mengedit Brand Brain.
- Data tersimpan lokal.
- Brand Brain otomatis dipakai saat generate prompt.

---

## 8.2 Prompt Generator

### Description

Prompt Generator membuat teks prompt siap copy untuk ChatGPT Plus.

### Prompt Types

- Idea prompt.
- Carousel prompt.
- Reels prompt.
- Image prompt.
- Caption improvement prompt.

### Input

```ts
type PromptInput = {
  topic: string;
  targetBusiness: string;
  contentPillar: string;
  contentGoal: string;
  format: "carousel" | "reels";
  slideCount?: number;
  sceneCount?: number;
};
```

### Output

```ts
type GeneratedPrompt = {
  title: string;
  prompt: string;
  type: "idea" | "carousel" | "reels" | "image" | "caption";
  createdAt: string;
};
```

### Acceptance Criteria

- App bisa generate prompt dari form input.
- Prompt berisi Brand Brain.
- Prompt meminta output JSON valid.
- User bisa copy prompt dengan satu tombol.
- Prompt tidak langsung dikirim ke API.

---

## 8.3 JSON Importer

### Description

JSON Importer menerima hasil ChatGPT dan mengubahnya menjadi draft yang bisa diedit.

### Requirements

- Textarea untuk paste hasil ChatGPT.
- Validasi JSON.
- Error message jelas jika JSON invalid.
- Auto-map field ChatGPT ke struktur draft aplikasi.
- Tidak crash jika ada field tambahan.
- Tidak menyimpan draft invalid.

### Carousel JSON Expected Format

```json
{
  "title": "",
  "pillar": "",
  "slides": [
    {
      "headline": "",
      "body": "",
      "image_prompt": ""
    }
  ],
  "caption": "",
  "hashtags": [],
  "cta": ""
}
```

### Reels JSON Expected Format

```json
{
  "title": "",
  "hook": "",
  "scenes": [
    {
      "duration": "0-3s",
      "visual": "",
      "text_overlay": "",
      "voiceover": "",
      "image_prompt": ""
    }
  ],
  "caption": "",
  "hashtags": [],
  "cta": ""
}
```

### Acceptance Criteria

- Valid JSON bisa diimport.
- Invalid JSON menampilkan pesan error.
- Field image_prompt otomatis masuk ke slide/scene.
- Draft yang berhasil diimport bisa diedit dan disimpan.

---

## 8.4 Carousel Studio

### Description

Carousel Studio adalah editor utama untuk membuat carousel Instagram.

### Requirements

- Preview slide ukuran 1080x1350.
- Editor headline per slide.
- Editor body per slide.
- Editor image prompt per slide.
- Upload image per slide.
- Remove image per slide.
- Edit caption.
- Edit hashtag.
- Edit CTA.
- Add slide.
- Remove slide.
- Reorder slide.
- Export current slide.
- Export all slides as ZIP.

### Slide Data

```ts
type CarouselSlide = {
  id: string;
  order: number;
  headline: string;
  body: string;
  imagePrompt: string;
  imageDataUrl?: string;
};
```

### Carousel Draft Data

```ts
type CarouselDraft = {
  id: string;
  title: string;
  format: "carousel";
  pillar: string;
  targetBusiness: string;
  status: ContentStatus;
  slides: CarouselSlide[];
  caption: string;
  hashtags: string[];
  cta: string;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
};
```

### Acceptance Criteria

- Slide preview tampil sesuai data.
- Edit slide langsung mengubah preview.
- Image upload tampil di slide.
- Export menghasilkan PNG.
- Export all menghasilkan ZIP.
- Draft bisa disimpan dan dibuka ulang.

---

## 8.5 Reels Studio

### Description

Reels Studio dipakai untuk membuat script reels berbasis scene.

### Requirements

- Edit hook.
- Edit scene duration.
- Edit visual direction.
- Edit text overlay.
- Edit voiceover.
- Edit image/video prompt.
- Edit caption.
- Edit hashtag.
- Edit CTA.
- Save draft.
- Copy full script.

### Scene Data

```ts
type ReelsScene = {
  id: string;
  order: number;
  duration: string;
  visual: string;
  textOverlay: string;
  voiceover: string;
  imagePrompt: string;
};
```

### Reels Draft Data

```ts
type ReelsDraft = {
  id: string;
  title: string;
  format: "reels";
  pillar: string;
  targetBusiness: string;
  status: ContentStatus;
  hook: string;
  scenes: ReelsScene[];
  caption: string;
  hashtags: string[];
  cta: string;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
};
```

### Acceptance Criteria

- Reels script bisa diimport dari JSON.
- Scene bisa diedit.
- Script bisa dicopy lengkap.
- Draft bisa disimpan.
- Draft bisa dibuka ulang.

---

## 8.6 Draft Library

### Description

Draft Library menampilkan seluruh draft konten.

### Requirements

- List draft.
- Search by title.
- Filter by format.
- Filter by status.
- Filter by pillar.
- Open draft.
- Duplicate draft.
- Delete draft.
- Change status.

### Status

```ts
type ContentStatus = "idea" | "draft" | "ready" | "posted";
```

### Acceptance Criteria

- Semua draft tersimpan tampil di library.
- Filter bekerja tanpa reload.
- Delete membutuhkan confirmation.
- Duplicate membuat draft baru dengan ID baru.

---

## 8.7 Content Calendar

### Description

Calendar sederhana untuk planning manual.

### Requirements

- Set scheduled date pada draft.
- View draft by date.
- Change status dari calendar.
- Add manual note.

### Acceptance Criteria

- Draft dengan scheduledAt tampil di calendar.
- User bisa update tanggal.
- User bisa update status.

---

## 9. Technical Stack

### 9.1 Core Stack

```text
Framework: Next.js App Router
Language: TypeScript
UI: Tailwind CSS + shadcn/ui
State Management: Zustand
Local Database: IndexedDB via Dexie
Validation: Zod
Export Image: html-to-image
ZIP: JSZip
File Download: file-saver
Icons: lucide-react
AI: ChatGPT Plus manual workflow
```

### 9.2 Runtime Mode

Fase MVP menggunakan client-heavy application.

```text
No API route
No server action
No auth
No server database
No paid API
```

### 9.3 Deployment

Prioritas:

```text
1. Local development
2. Static export
3. Cloudflare Pages / Vercel optional
```

---

## 10. Recommended Folder Structure

Struktur dibuat supaya mudah ditrace dan tidak terlalu tersebar.

```text
src/
├── app/
│   ├── page.tsx
│   ├── brand/page.tsx
│   ├── ideas/page.tsx
│   ├── carousel/page.tsx
│   ├── reels/page.tsx
│   ├── drafts/page.tsx
│   └── calendar/page.tsx
│
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx
│   │   ├── Sidebar.tsx
│   │   └── PageHeader.tsx
│   │
│   ├── ui/
│   │   └── shadcn components
│   │
│   └── shared/
│       ├── CopyButton.tsx
│       ├── EmptyState.tsx
│       ├── StatusBadge.tsx
│       └── ConfirmDialog.tsx
│
├── features/
│   ├── brand/
│   │   ├── BrandBrainPage.tsx
│   │   ├── BrandBrainForm.tsx
│   │   └── brand.repository.ts
│   │
│   ├── prompts/
│   │   ├── PromptBuilderPage.tsx
│   │   ├── PromptForm.tsx
│   │   ├── PromptPreview.tsx
│   │   └── prompt-builder.ts
│   │
│   ├── carousel/
│   │   ├── CarouselPage.tsx
│   │   ├── CarouselEditor.tsx
│   │   ├── CarouselSlidePreview.tsx
│   │   ├── CarouselSlideForm.tsx
│   │   ├── carousel.mapper.ts
│   │   ├── carousel.schema.ts
│   │   └── carousel.repository.ts
│   │
│   ├── reels/
│   │   ├── ReelsPage.tsx
│   │   ├── ReelsEditor.tsx
│   │   ├── ReelsSceneForm.tsx
│   │   ├── reels.mapper.ts
│   │   ├── reels.schema.ts
│   │   └── reels.repository.ts
│   │
│   ├── drafts/
│   │   ├── DraftLibraryPage.tsx
│   │   ├── DraftList.tsx
│   │   ├── DraftFilters.tsx
│   │   └── draft.repository.ts
│   │
│   └── calendar/
│       ├── CalendarPage.tsx
│       ├── CalendarBoard.tsx
│       └── calendar.repository.ts
│
├── lib/
│   ├── db.ts
│   ├── id.ts
│   ├── date.ts
│   ├── image-export.ts
│   ├── zip-export.ts
│   ├── json.ts
│   └── result.ts
│
└── types/
    ├── brand.ts
    ├── content.ts
    ├── carousel.ts
    └── reels.ts
```

---

## 11. Coding Standard

## 11.1 General Principle

Kode harus gampang dibaca oleh developer yang sedang tracing flow dari UI sampai storage.

Prinsip utama:

```text
Readable > clever
Explicit > magical
Flat control flow > nested condition
Feature-based folder > random helper everywhere
Few meaningful functions > too many tiny wrappers
```

---

## 11.2 No Deep Nested If

Hindari bentuk seperti ini:

```ts
if (draft) {
  if (draft.slides) {
    if (draft.slides.length > 0) {
      if (draft.status === "ready") {
        // logic
      }
    }
  }
}
```

Gunakan guard clause:

```ts
if (!draft) return;
if (!draft.slides?.length) return;
if (draft.status !== "ready") return;

// logic
```

---

## 11.3 Function Style

Gunakan function yang jelas dan tidak terlalu tersebar.

Baik:

```ts
function saveCarouselDraft(draft: CarouselDraft) {
  const payload = prepareCarouselPayload(draft);
  return carouselRepository.save(payload);
}
```

Hindari terlalu banyak lempar function seperti:

```ts
handleSave()
  -> validateInput()
  -> normalizeInput()
  -> mapInput()
  -> buildPayload()
  -> enrichPayload()
  -> persistPayload()
  -> notifySuccess()
```

Untuk MVP, flow seperti ini lebih mudah ditrace:

```ts
async function handleSave() {
  const validation = validateCarouselDraft(draft);

  if (!validation.success) {
    setError(validation.message);
    return;
  }

  const payload = {
    ...draft,
    updatedAt: new Date().toISOString(),
  };

  await carouselRepository.save(payload);
  setStatus("saved");
}
```

---

## 11.4 Repository Pattern Sederhana

Repository boleh dipakai, tapi jangan dibuat terlalu enterprise.

Contoh cukup:

```ts
export const carouselRepository = {
  async findAll() {},
  async findById(id: string) {},
  async save(draft: CarouselDraft) {},
  async delete(id: string) {},
};
```

Tidak perlu:

```text
Repository Interface
Repository Implementation
Repository Factory
Use Case Layer
Service Layer
Controller Layer
```

Untuk MVP internal tool, itu terlalu berat.

---

## 11.5 Component Rule

Komponen boleh dipisah jika:

- Dipakai ulang.
- Ukurannya terlalu besar.
- Punya tanggung jawab UI yang jelas.
- Memisahkan preview dan form membuat kode lebih mudah dibaca.

Komponen tidak perlu dipisah jika:

- Cuma 5-10 baris.
- Dipakai sekali.
- Namanya malah bikin tracing lebih susah.
- Hanya wrapper tanpa logic.

---

## 11.6 File Size Guideline

Panduan ukuran file:

```text
Page component: maksimal ±250 baris
Editor component: maksimal ±350 baris
Small component: 30-150 baris
Repository: 50-150 baris
Mapper/schema: 50-150 baris
```

Kalau file lebih besar, pecah berdasarkan bagian yang benar-benar jelas, bukan asal pecah.

---

## 11.7 Naming Convention

Gunakan nama yang langsung menjelaskan maksud:

```text
Good:
CarouselEditor.tsx
CarouselSlidePreview.tsx
buildCarouselPrompt()
importCarouselJson()
saveCarouselDraft()

Bad:
Handler.tsx
Utils.ts
ProcessData.ts
Manager.ts
Helper.ts
```

---

## 11.8 Error Handling

Gunakan pola result sederhana.

```ts
type Result<T> =
  | { success: true; data: T }
  | { success: false; message: string };
```

Contoh:

```ts
function parseCarouselJson(rawJson: string): Result<CarouselDraft> {
  if (!rawJson.trim()) {
    return { success: false, message: "JSON masih kosong." };
  }

  try {
    const parsed = JSON.parse(rawJson);
    const validation = carouselSchema.safeParse(parsed);

    if (!validation.success) {
      return { success: false, message: "Format JSON carousel belum sesuai." };
    }

    return {
      success: true,
      data: mapCarouselJsonToDraft(validation.data),
    };
  } catch {
    return { success: false, message: "JSON tidak valid." };
  }
}
```

---

## 12. Data Model

## 12.1 BrandProfile

```ts
type BrandProfile = {
  id: string;
  name: string;
  positioning: string;
  targetAudience: string;
  offers: string[];
  toneOfVoice: string;
  mainMessage: string;
  cta: string;
  contentRules: string[];
  forbiddenStyles: string[];
  updatedAt: string;
};
```

## 12.2 ContentDraft Base

```ts
type ContentStatus = "idea" | "draft" | "ready" | "posted";
type ContentFormat = "carousel" | "reels";

type ContentDraftBase = {
  id: string;
  title: string;
  format: ContentFormat;
  pillar: string;
  targetBusiness: string;
  status: ContentStatus;
  caption: string;
  hashtags: string[];
  cta: string;
  scheduledAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};
```

## 12.3 CarouselDraft

```ts
type CarouselDraft = ContentDraftBase & {
  format: "carousel";
  slides: CarouselSlide[];
};
```

## 12.4 ReelsDraft

```ts
type ReelsDraft = ContentDraftBase & {
  format: "reels";
  hook: string;
  scenes: ReelsScene[];
};
```

## 12.5 Local Database Tables

```text
brandProfiles
contentDrafts
promptHistory
exportHistory
```

---

## 13. Execution Plan

Eksekusi harus runut seperti ini:

```text
Design → Frontend → Backend/Persistence → Integration → QA
```

---

# 13.1 Design Phase

## Objective

Menentukan UX, layout, screen, state, dan alur pengguna sebelum coding.

## Deliverables

- Sitemap.
- User flow.
- Wireframe low fidelity.
- UI component inventory.
- Data state per screen.
- Empty/error/loading state.

## Screens to Design

```text
1. Dashboard
2. Brand Brain
3. Idea Prompt Generator
4. Carousel Studio
5. Reels Studio
6. Draft Library
7. Content Calendar
```

## Design Rules

- UI simple dan fungsional.
- Prioritaskan textarea, preview, dan tombol copy.
- Jangan terlalu banyak modal.
- Satu layar harus jelas tujuan utamanya.
- Preview carousel harus dominan di Carousel Studio.
- Form editor harus mudah discan.

## Acceptance Criteria

- Semua screen punya wireframe.
- Semua user flow utama sudah jelas.
- Tidak ada screen yang belum jelas input-output-nya.
- Struktur navigasi sudah final untuk MVP.

---

# 13.2 Frontend Phase

## Objective

Membangun UI dan interaction layer berdasarkan design.

## Tasks

### 13.2.1 Setup Project

```text
- Setup Next.js + TypeScript.
- Setup Tailwind.
- Setup shadcn/ui.
- Setup folder structure.
- Setup AppShell layout.
- Setup navigation.
```

### 13.2.2 Build Static Screens

```text
- Dashboard page.
- Brand Brain page.
- Idea Generator page.
- Carousel Studio page.
- Reels Studio page.
- Draft Library page.
- Calendar page.
```

### 13.2.3 Build UI Components

```text
- PageHeader.
- Sidebar.
- CopyButton.
- StatusBadge.
- PromptPreview.
- JsonImporter.
- CarouselSlidePreview.
- CarouselSlideForm.
- ReelsSceneForm.
- DraftFilters.
- DraftList.
```

### 13.2.4 Build Local State

```text
- Form state.
- Draft editor state.
- Selected slide state.
- Selected scene state.
- Import JSON state.
- Export progress state.
```

## Frontend Acceptance Criteria

- Semua halaman bisa dibuka.
- Navigasi berfungsi.
- Form bisa diisi.
- Preview update sesuai input.
- Copy button bekerja.
- Tidak ada dummy interaction yang terlihat final tapi belum bekerja.

---

# 13.3 Backend / Persistence Phase

## Objective

Membangun data layer lokal menggunakan IndexedDB via Dexie.

Catatan: Karena MVP tidak memakai backend server, istilah backend di fase ini berarti local persistence layer dan data operation layer.

## Tasks

### 13.3.1 Setup IndexedDB

```text
- Buat lib/db.ts.
- Definisikan table brandProfiles.
- Definisikan table contentDrafts.
- Definisikan table promptHistory.
- Definisikan table exportHistory.
```

### 13.3.2 Repository

```text
- brand.repository.ts
- carousel.repository.ts
- reels.repository.ts
- draft.repository.ts
- calendar.repository.ts
```

Repository dibuat sederhana.

### 13.3.3 Data Validation

```text
- brand schema.
- carousel import schema.
- reels import schema.
- draft schema.
```

### 13.3.4 Data Operations

```text
- Save brand profile.
- Load brand profile.
- Save carousel draft.
- Load carousel draft.
- Save reels draft.
- Load reels draft.
- List drafts.
- Delete draft.
- Duplicate draft.
- Update draft status.
- Update scheduled date.
```

## Backend/Persistence Acceptance Criteria

- Data tetap ada setelah browser reload.
- Draft bisa dibuka ulang.
- Delete benar-benar menghapus data.
- Duplicate membuat ID baru.
- Invalid data tidak disimpan.

---

# 13.4 Integration Phase

## Objective

Menghubungkan UI, data layer, prompt builder, JSON importer, image upload, dan export.

## Integration Scope

### 13.4.1 Brand Brain → Prompt Builder

```text
Brand profile dipakai otomatis saat membuat prompt.
```

### 13.4.2 Prompt Builder → Clipboard

```text
Generated prompt bisa dicopy ke clipboard.
```

### 13.4.3 ChatGPT JSON → JSON Importer

```text
User paste hasil ChatGPT.
App parse JSON.
App map JSON ke draft.
App buka editor.
```

### 13.4.4 Carousel Editor → IndexedDB

```text
Edit slide.
Save draft.
Reload browser.
Draft tetap ada.
```

### 13.4.5 Image Upload → Slide Preview

```text
Upload image.
Convert/store data URL atau Blob.
Tampilkan di preview slide.
```

### 13.4.6 Slide Preview → PNG Export

```text
Render slide 1080x1350.
Export ke PNG.
Download file.
```

### 13.4.7 All Slides → ZIP Export

```text
Loop semua slide.
Export tiap slide.
Masukkan ke ZIP.
Download ZIP.
```

### 13.4.8 Draft → Calendar

```text
Set scheduledAt.
Draft muncul di calendar.
Update status dari calendar.
```

## Integration Acceptance Criteria

- Flow carousel dari prompt sampai export berjalan end-to-end.
- Flow reels dari prompt sampai save draft berjalan end-to-end.
- Tidak ada data hilang saat reload.
- Export file bisa dibuka normal.
- JSON invalid tidak merusak state aplikasi.

---

# 13.5 QA Phase

## Objective

Memastikan aplikasi stabil untuk pemakaian internal harian.

## QA Checklist

### 13.5.1 Functional QA

```text
- Brand Brain bisa disimpan.
- Prompt carousel bisa dibuat.
- Prompt reels bisa dibuat.
- Prompt bisa dicopy.
- JSON carousel valid bisa diimport.
- JSON reels valid bisa diimport.
- JSON invalid menampilkan error.
- Carousel slide bisa diedit.
- Reels scene bisa diedit.
- Draft bisa disimpan.
- Draft bisa dibuka ulang.
- Draft bisa dihapus.
- Draft bisa diduplicate.
- Status draft bisa diubah.
- Scheduled date bisa diubah.
- Image bisa diupload ke slide.
- Slide bisa diexport PNG.
- Semua slide bisa diexport ZIP.
```

### 13.5.2 UI QA

```text
- Layout tidak pecah di desktop.
- Form mudah dibaca.
- Button state jelas.
- Error message jelas.
- Empty state tersedia.
- Preview carousel proporsional.
- Scroll behavior nyaman.
```

### 13.5.3 Data QA

```text
- Data tidak hilang saat reload.
- Draft tidak tertukar.
- Duplicate draft tidak memakai ID lama.
- Delete tidak menghapus draft lain.
- Import JSON tidak overwrite draft tanpa konfirmasi.
```

### 13.5.4 Export QA

```text
- PNG berukuran benar.
- ZIP bisa dibuka.
- Nama file rapi.
- Slide order benar.
- Text tidak kepotong.
- Image tampil sesuai preview.
```

### 13.5.5 Code QA

```text
- Tidak ada nested if berlebihan.
- Tidak ada file terlalu besar tanpa alasan.
- Tidak ada helper random yang susah ditrace.
- Function name jelas.
- TypeScript type tidak memakai any sembarangan.
- Repository tetap sederhana.
- Komponen tidak terlalu dipecah tanpa manfaat.
```

---

## 14. Milestone Plan

## Milestone 1 — Foundation

### Scope

```text
- Setup project.
- Setup layout.
- Setup navigation.
- Setup Brand Brain page.
- Setup IndexedDB.
```

### Done When

```text
User bisa edit dan simpan Brand Brain.
```

---

## Milestone 2 — Prompt Workflow

### Scope

```text
- Prompt generator carousel.
- Prompt generator reels.
- Prompt preview.
- Copy prompt.
```

### Done When

```text
User bisa membuat prompt siap paste ke ChatGPT.
```

---

## Milestone 3 — JSON Import + Carousel Editor

### Scope

```text
- JSON importer.
- Carousel schema.
- Carousel mapper.
- Carousel editor.
- Carousel preview.
```

### Done When

```text
User bisa paste JSON ChatGPT dan melihat carousel preview.
```

---

## Milestone 4 — Save Draft + Draft Library

### Scope

```text
- Save carousel draft.
- List draft.
- Open draft.
- Delete draft.
- Duplicate draft.
- Filter draft.
```

### Done When

```text
Draft tersimpan dan bisa dibuka ulang.
```

---

## Milestone 5 — Image Upload + Export

### Scope

```text
- Upload image per slide.
- Preview image.
- Export current slide PNG.
- Export all slides ZIP.
```

### Done When

```text
Carousel bisa diexport sebagai file siap upload.
```

---

## Milestone 6 — Reels Studio

### Scope

```text
- Reels JSON importer.
- Scene editor.
- Copy full script.
- Save reels draft.
```

### Done When

```text
User bisa membuat dan menyimpan reels script.
```

---

## Milestone 7 — Calendar + QA

### Scope

```text
- Scheduled date.
- Calendar view.
- Status update.
- Full QA.
- Bug fixing.
```

### Done When

```text
Aplikasi siap dipakai harian untuk produksi konten DigytaLab.
```

---

## 15. MVP Success Metrics

Karena ini internal tool, metric-nya praktis:

```text
- Bisa menghasilkan minimal 5 carousel draft per minggu.
- Waktu bikin carousel turun minimal 50%.
- Konten punya format dan CTA lebih konsisten.
- Minimal 80% konten tidak perlu dirapikan dari nol di luar aplikasi.
- User bisa export carousel tanpa buka Canva/Figma untuk layout basic.
```

---

## 16. Risks & Mitigations

### Risk 1 — JSON dari ChatGPT sering invalid

Mitigation:

```text
- Prompt wajib minta valid JSON.
- App punya error message jelas.
- Tambahkan contoh JSON di prompt.
- Sediakan tombol copy ulang prompt.
```

### Risk 2 — IndexedDB penuh karena image besar

Mitigation:

```text
- Compress image sebelum simpan.
- Batasi ukuran upload.
- Simpan warning jika image terlalu besar.
- Fase awal simpan data URL secukupnya.
```

### Risk 3 — Export tidak sama dengan preview

Mitigation:

```text
- Gunakan fixed canvas size 1080x1350.
- Batasi font dan layout.
- Test export tiap template.
```

### Risk 4 — Scope melebar ke Canva clone

Mitigation:

```text
- Tidak ada drag-drop di MVP.
- Template fixed dulu.
- Fokus ke prompt, editing, dan export.
```

### Risk 5 — Kode terlalu ribet

Mitigation:

```text
- Feature-based folder.
- Guard clause.
- Repository sederhana.
- Hindari abstraction terlalu dini.
- Review file size tiap milestone.
```

---

## 17. First Build Recommendation

Build pertama yang paling masuk akal:

```text
1. Setup Next.js.
2. Buat AppShell + Sidebar.
3. Buat Brand Brain page.
4. Simpan Brand Brain ke IndexedDB.
5. Buat Carousel Prompt Generator.
6. Buat JSON Importer.
7. Buat Carousel Preview basic.
8. Buat Export PNG single slide.
```

Jangan mulai dari calendar, reels, atau banyak template. Validasi dulu carousel workflow sampai benar-benar bisa dipakai.

---

## 18. Definition of Done MVP

MVP dianggap selesai jika:

```text
- Brand Brain bisa disimpan.
- Prompt carousel bisa dibuat dan dicopy.
- Hasil JSON ChatGPT bisa diimport.
- Carousel bisa diedit.
- Image bisa diupload ke slide.
- Carousel bisa diexport PNG/ZIP.
- Draft bisa disimpan dan dibuka ulang.
- Reels script bisa dibuat dan disimpan.
- Calendar sederhana bisa menampilkan scheduled draft.
- QA checklist utama lolos.
```

---

## 19. Final Product Scope Statement

DigyContent Studio MVP adalah aplikasi internal berbasis Next.js untuk membantu DigytaLab membuat konten Instagram secara lebih cepat dan konsisten. Aplikasi ini tidak menggantikan ChatGPT Plus, Canva, atau CapCut secara penuh, tetapi menjadi workflow manager yang menghubungkan brand strategy, prompt generation, content editing, image prompt handling, draft storage, dan export carousel siap upload.

Fokus utama MVP adalah kecepatan produksi, konsistensi pesan, dan kemudahan tracing kode.


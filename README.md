# kapydev — Patient Voices Platform (患者の声掲示板)

A web application for patients to anonymously share their disease experiences, built with **Next.js 14** and **Supabase**.

---

## Concept

Patients living with serious or chronic illnesses often find it difficult to discuss their experiences in everyday settings. This platform gives them a safe, searchable space to share their stories — covering symptoms, treatments, side-effects, and day-to-day coping strategies.

Key principles:
- **Anonymity first** — nicknames are optional; posts default to 「匿名」 (anonymous)
- **Peer knowledge, not medical advice** — a mandatory disclaimer and consent checkbox ensures every submission is understood as personal experience
- **Discoverability through synonyms** — diseases are stored with synonym arrays so that searching 「膵臓がん」 automatically surfaces posts filed under 「膵臓癌」 or 「すい臓がん」
- **Moderated publication** — every post starts in `pending` state and is only shown publicly after admin approval

---

## Architecture

```
kapydev/
├── app/
│   ├── layout.js          # Root layout (HTML shell, global styles)
│   ├── page.js            # Home page — search, filter, post listing
│   ├── post/
│   │   └── page.js        # Submission form for new patient posts
│   └── admin/
│       └── page.js        # Password-protected admin moderation panel
└── lib/
    └── supabase.js        # Supabase client initialisation
```

### Database tables (Supabase / PostgreSQL)

| Table | Purpose |
|---|---|
| `categories` | Top-level disease groups (e.g. 癌, 神経系疾患) ordered by `display_order` |
| `diseases` | Individual diseases with `primary_name`, `synonyms[]`, and a FK to `categories` |
| `posts` | Patient submissions — linked to a disease, with optional `nickname`, `age_range`, `gender`, `email`, and a moderation `status` |

Post `status` lifecycle: `pending` → `approved` (visible on home page) or `rejected`. Posts that violate guidelines can be flagged as `reported`.

---

## Pages

### Home (`/`)
- **Category filter** — dropdown populated from `categories`
- **Keyword search** — searches disease name, synonyms, post content, and nickname simultaneously
- **Post listing** — shows only `approved` posts ordered by newest first
- Link to the submission form

### Submission form (`/post`)
- Cascading selects: choose a category, then a disease within that category
- Freeform content textarea for the patient's narrative
- Optional demographic fields: nickname, age range, gender
- Optional contact email
- Mandatory disclaimer checkbox — submission is blocked until the user consents

### Admin panel (`/admin`)
- Client-side password gate (password currently stored as a component constant — for production use, replace with server-side authentication such as [Supabase Auth](https://supabase.com/docs/guides/auth) or [NextAuth.js](https://next-auth.js.org/))
- Filter tabs: 承認待ち / 承認済み / 却下済み / 通報あり / 全て
- Per-post action buttons: 承認 (approve), 却下 (reject), 削除 (delete)

---

## Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project with the tables described above

### Environment variables

Create a `.env.local` file at the project root:

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

### Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for production

```bash
npm run build
npm start
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 14](https://nextjs.org/) (App Router) |
| UI | React 18, inline styles |
| Backend / DB | [Supabase](https://supabase.com) (PostgreSQL + auto-generated REST API) |
| Auth | Client-side password check (admin panel only) |

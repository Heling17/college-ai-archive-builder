---
name: college-ai-archive-builder
description: Build or update a standalone Chinese university-student growth archive website with searchable records, resume material extraction, local persistence, JSON backup, and browser-local file attachments. Use when someone wants to organize certificates, scholarships, competitions, research, internships, campus practice, portfolios, or comprehensive-assessment materials into a reusable personal archive.
metadata:
  short-description: Build a reusable university growth archive website
---

# College AI Archive Builder

Use this Skill to deliver a finished, copy-and-open university experience archive, not a code sketch.

## Required deliverable

- Start from `assets/index.html`, which is the tested, dependency-free template.
- Deliver a single `index.html` containing HTML, CSS, and JavaScript. It must open by double-clicking and must not require npm, a server, a database account, a CDN, or a framework.
- If the user gives personal experiences, put those into the initial data without inventing missing facts. Keep unknown fields editable and label any fabricated demo data clearly as 示例.
- Keep the existing visual style: clean, youthful, practical, responsive, with a left navigation on desktop and a bottom navigation on mobile.

## Archive capabilities that must remain available

The generated page must include all of these modules:

- Growth dashboard with counts for honors, competitions/projects, research, internships, campus/social practice, and portfolio work.
- Record management for those six categories: add, edit, delete, detail view, keyword search, category/year/tag filters, and date/recently-added sorting.
- University growth timeline and yearly statistics.
- Resume-material view that extracts role, actions, outcomes, metrics, tools, and abilities. It may offer a “copy AI prompt” action, but must not pretend to call an AI API without one.
- Browser `localStorage` persistence for structured profile and record data.
- JSON merge import, overwrite import, and export with a dated filename.
- Clear, visible privacy guidance: sensitive identity documents, passwords, bank details, and confidential third-party/company files should not be placed in the archive.

## File attachments

Each record must support multiple attachments for certificates, scans, screenshots, PDFs, images, or project files.

- Store attachment blobs in browser `IndexedDB`, keyed by record ID. Do not put large binary files in `localStorage`.
- In each record detail view, provide direct `打开` and `下载` actions. In the edit form, provide the ability to add and remove attachments.
- Deleting a record should also remove its associated attachment records.
- Tell the user that attachments belong to the current browser profile and can be lost when browser data is cleared. JSON export should clearly state whether it includes original files; the template exports structured data only, so important originals still need an independent backup.

## Data and interaction rules

- Use a stable record schema compatible with the template: `id`, `category`, `title`, `date`, `year`, `org`, `type`, `award`, `role`, `team`, `tools`, `description`, `responsibilities`, `outcome`, `metrics`, `abilities`, `summary`, `tags`, `material`, `isExample`, and `createdAt`.
- Escape user-entered values before inserting them into HTML.
- Keep import validation and merge/overwrite confirmation. Never silently overwrite existing user data.
- Never require a user to understand programming or manually paste a large HTML file.

## Personalization

Ask only for information that materially changes the result. A user’s grade, major, target use (comprehensive assessment, scholarship, internship, graduate recommendation), and known experiences are enough to start. If details are missing, create editable placeholders and let the user fill them later.

For a sophomore student, make the page immediately useful for scholarship, comprehensive assessment, certificates, competitions, course projects, and campus practice; do not reduce the archive to only scholarships.

## Verification before delivery

After adapting the template:

1. Confirm the output file exists and is a standalone `index.html`.
2. Extract the inline `<script>` and run a JavaScript syntax check with Node when available.
3. Check that attachment APIs, `localStorage`, JSON import/export, responsive CSS, and the six category labels remain present.
4. If a browser is available, smoke-test opening the file, adding a record, attaching a small file, reopening its detail view, and exporting JSON. If a browser is not available, report the static checks performed without claiming a browser test.

Deliver the file path, how to open it, where data is stored, and the backup limitation in a short handoff.


# TCA Online Preschool — Project Context

## What This Project Is

A marketing website for **Taylor Christian Academy Online Preschool** — a Christ-centered, live online preschool program for children ages 3–5, founded by Sherri Taylor. The site is built as plain HTML/CSS/JS with no frameworks or build tools. All styles and scripts are inline within each HTML file.

**Live repository:** https://github.com/mjasey/TCA-Online-Preschool
**Production site:** https://enroll.tcaarts.org/

## Live Hosting & Owner Workspace

- **Primary site:** https://enroll.tcaarts.org/
- **Enrollment page:** https://enroll.tcaarts.org/enroll.html
- **Owner workspace:** https://enroll.tcaarts.org/manage/
- **Vercel project:** `tca-online-preschool`
- **Supabase project:** `tca-owner-workspace` (`yssnrzbnxrfmeebhbkfr`)
- **Approved editors:** `michael.jasey@gmail.com` (admin), `sherri.taylor@hotmail.com` (editor)

The owner workspace is a private content editor for the home, enrollment, and giving pages. Editors can save drafts, preview the real page at desktop or mobile size, publish approved content, upload replacement images/videos, and submit larger layout or feature requests. Published values are loaded onto the public pages by `content-runtime.js`; the original HTML remains the fallback.

Larger website requests are stored in Supabase, copied to the Google Sheet's `Website Changes` tab through the existing Apps Script web app, and emailed to the configured request address. Sherri Taylor is approved for the owner workspace and has writer access to the Google Sheet.

---

## Brand & Design System

- **Primary Font:** Playfair Display (headings, quotes) — Google Fonts
- **Secondary Font:** Lato (body, labels, buttons) — Google Fonts
- **Colors:**
  - Navy: `#1B3A6B`
  - Dark Navy: `#0F2347`
  - Gold: `#F0B429`
  - Red: `#C0392B`
  - White: `#FFFFFF`
  - Light: `#F9F7F4`
- **CSS Custom Properties:** defined in `:root` at top of each file
- **Scroll Reveal:** CSS IntersectionObserver with `.reveal`, `.reveal-left`, `.reveal-right`, `.stagger` classes

---

## Files & Their Purposes

### HTML Pages
| File | Purpose |
|------|---------|
| `index.html` | Main homepage — hero, Why TCA, curriculum, photo strip, stats, mission, proverbs banner, team, pricing, testimonial, enroll video, enroll/contact, footer. About info merged here under #mission. |
| `enroll.html` | Enrollment page — 3-step process, pricing cards, class times |

### Images
| File | Used In |
|------|---------|
| `Sherri.png` | Team section (index.html) |
| `Vanessa.png` | Team section (index.html) |
| `teacher_zoom.png` | Owner workspace sign-in background |
| `logo-transparent.png` | Social sharing image |

### Videos
| File | Used In | Behavior |
|------|---------|---------|
| `hero-video.mp4` | Hero section (index.html) | `autoplay loop muted` background |
| `proverbs-banner.mp4` | Proverbs/JOIN banner (index.html) | `autoplay loop muted` background |
| `Sherri-Why-Choose.mp4` | Why Choose TCA two-column section (index.html) | `controls` — user plays, NOT muted |
| `Vanessa-Demo.mp4` | Vanessa lightbox overlay (index.html) | `controls` — user plays, NOT muted |

### Other
| File | Purpose |
|------|---------|
| `TCA CUTEY tips.txt` | Internal notes/tips content |
| `CONTEXT.md` | This file — project documentation |

---

## External Links

### Enrollment
- **POWr Checkout (Enroll Now / Enroll Today buttons):**
  `https://www.powr.io/checkout_screen?unique_label=1a0a146a_1737210627`

### Donations
- **PayPal Donate:**
  `https://www.paypal.com/donate?business=info@tcaarts.org&currency_code=USD`

### Social Media
- **Facebook:** (linked in footer social icons — confirm correct URL in footer HTML)
- **Instagram:** (linked in footer social icons — confirm correct URL in footer HTML)

### Contact
- **Email:** `info@tcaarts.org` — `mailto:info@tcaarts.org`
- **Phone:** `908-738-1343` — `tel:9087381343`
- **Address:** 3 Skiles Avenue #841, Piscataway, NJ 08855

---

## What Was Built

### index.html
- Fixed navbar: frosted glass, gradient border-bottom, logo letter animation, hover dropdowns (CSS), active page indicator
- Red announcement bar above navbar with localStorage close/remember
- Hero: full-screen video background, school name, gold badge, heading, subtitle, Proverbs verse, CTA buttons
- Why Choose TCA: two-column layout (Sherri video left, feature rows right), gold pulsing border on video
- Curriculum: 6-card grid + Vanessa video lightbox button
- Photo strip: 3 side-by-side photos with hover scale
- Stats bar: 4 stats (students, years, enrollment, rating)
- Mission statement section
- JOIN THE TCA FAMILY video banner (proverbs-banner.mp4)
- Our Team: Sherri + Vanessa cards (equal height flex layout)
- Team CTA gold banner
- Pricing: 3-tier pricing grid on dark navy
- Testimonial section with quote
- Enroll video banner (testimonial-video.mp4)
- Enroll/Contact section with form and contact info
- Footer: logo, nav, social icons, donate button, disclaimer

### About page (removed)
- The standalone About page was removed. About content (mission, team, how-it-works) is consolidated under sections within index.html and linked via the About dropdown anchors (`#mission`, `#how-it-works`, `#team`).

---

## Current Operations

### Free trial launch — November 21, 2026

- Home and enrollment pages load `trial-signup.js`, `free-trial.js`, and `trial.css`.
- Approved design: gold Try Free Classes navigation, floating Try 2 Free Classes button, and compressed responsive WebP flyer. Homepage trial section follows What Makes TCA Different (`#foundation`). Mobile shows the signup information before the flyer.
- Parents request two Thursday classes, 5:30–6:15 PM Eastern. The next upcoming Thursday is skipped for mailing time. Both dates require Sherri’s confirmation; holidays are not automatically excluded.
- Form collects guardian contact, child name/DOB/calculated age/interests, mailing address, two dates, notes, and guardian consent. No payment or automatic subscription.
- `POST /api/free-trial` validates on the server, forwards through the existing protected Apps Script receiver, and never returns a spreadsheet URL or family data.
- Production requests append to **Free Trials**, gid `9212026`, in https://docs.google.com/spreadsheets/d/1q0nGGA6CpFyhQYY0hvNnNjHo_hoP86zSzUBDuE5aF3o/edit . The preview-only **Free Trial Test** tab remains separate.
- Apps Script source: `Code.gs` + `TrialPreview.gs` + `FreeTrials.gs` combined in the bound project. Existing webhook URL and secret are unchanged. Version 8 adds the live receiver with checkbox-safe row placement and readable dates. Checkboxes are created only on real request rows, so unused rows stay empty.
- Each new request emails `sherri.taylor@hotmail.com`. Reply-To is the parent. Alert links to the private sheet and omits DOB/address/child details. Email Alert column records Sent or Needs attention. Retrying the same request ID reuses the saved row and retries a failed alert; a new submission from the same email creates a separate row.
- Sherri has writer access to the spreadsheet; Google sharing invitation sent at launch.
- Sherri manually confirms dates, mails supplies, sends joining instructions, checks actual attendance, then sends https://enroll.tcaarts.org/enroll.html#plans after both classes. Checkboxes do not send automatic follow-up emails.
- SMS is not configured; email and spreadsheet tracking are the approved first version.
- Current paid class availability: Monday–Friday 10:00–10:45 AM Eastern and Thursday 5:30–6:15 PM Eastern. Local fallbacks, owner schema defaults, and saved CMS content are aligned at launch.
- Checks: `node tests/free_trial_api_test.cjs`, `node tests/free_trial_browser_test.cjs`, and `node tests/site_regression_test.cjs` (Playwright dependency available in the Codex runtime; use BASE_URL for a deployed target). Browser tests mock submissions; a separately labeled live launch test verifies the real sheet/alert path.

- **Hosting:** Vercel serves the production site at `enroll.tcaarts.org`; `main` is the production branch.
- **Contact messages:** the homepage form posts to `/api/contact`, which records each submission as a separate Google Sheets row through the Apps Script web app.
- **Website-change requests:** the private owner workspace records requests in Supabase, adds them to the Google Sheet's `Website Changes` tab, and emails the configured request address.
- **Current class times (Eastern):** Monday–Friday 10:00–10:45 AM; Thursday 5:30–6:15 PM.
- **Editor access:** Sherri Taylor is an approved editor. The portal uses email/password sign-in and provides a Forgot your password flow.
- **Accessibility note:** background videos are decorative. The two visitor-played videos still need supplied captions/transcripts before caption tracks can be added accurately.

---

## Git Commands Reference

```bash
# First-time setup (already done)
git init
git remote add origin https://github.com/mjasey/TCA-Online-Preschool.git
git branch -M main
git push -u origin main

# Standard workflow for future updates
git add .
git commit -m "describe what changed"
git push

# Check status
git status

# View commit history
git log --oneline
```

**Git identity (already configured globally):**
```bash
git config --global user.name "Michael Jasey"
git config --global user.email "michael.jasey@gmail.com"
```

---

*Last updated: November 21, 2026*

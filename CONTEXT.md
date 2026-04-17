# TCA Online Preschool — Project Context

## What This Project Is

A marketing website for **Taylor Christian Academy Online Preschool** — a Christ-centered, live online preschool program for children ages 3–5, founded by Sherri Taylor. The site is built as plain HTML/CSS/JS with no frameworks or build tools. All styles and scripts are inline within each HTML file.

**Live Repository:** https://github.com/mjasey/TCA-Online-Preschool
**GitHub Pages (when enabled):** https://mjasey.github.io/TCA-Online-Preschool/

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
| `teacher_zoom.png` | Photo strip (index.html) |
| `Parent_and_child_.png` | Photo strip (index.html) |
| `bro-sis.png` | Photo strip (index.html) |
| `tca-logo.png` | Available but not currently used (CSS logo used instead) |

### Videos
| File | Used In | Behavior |
|------|---------|---------|
| `hero-video.mp4` | Hero section (index.html) | `autoplay loop muted` background |
| `proverbs-banner.mp4` | Proverbs/JOIN banner (index.html) | `autoplay loop muted` background |
| `testimonial-video.mp4` | Enroll video section (index.html) | `autoplay loop muted` background |
| `Sherri-Why-Choose.mp4` | Why Choose TCA two-column section (index.html) | `controls` — user plays, NOT muted |
| `Vanessa-Demo.MP4` | Vanessa lightbox overlay (index.html) | `controls` — user plays, NOT muted |

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

## What Still Needs to Be Done

- [ ] **enroll.html** — "How To Enroll" button currently links to `#pricing` (index) / `index.html#pricing` (about). A dedicated enrollment process page (`enroll.html`) was planned but not yet built.
- [ ] **Social media URLs** — Confirm correct Facebook and Instagram URLs are in the footer of both files.
- [ ] **Contact form** — The enroll section has a form that submits to `mailto:info@tcaarts.org`. Consider a proper form handler (Formspree, Netlify Forms, etc.) for reliability.
- [ ] **GitHub Pages** — Enable in repo Settings → Pages → Branch: `main` → `/root` to make the site publicly accessible.
- [ ] **Custom domain** — If a custom domain (e.g. `tcaonlinepreschool.com`) is purchased, configure it in GitHub Pages settings and add a `CNAME` file.
- [ ] **SEO meta tags** — Add `<meta name="description">`, Open Graph tags, and favicon to both pages.
- [ ] **Mobile polish** — Test on real devices; mobile hamburger menu and video backgrounds may need additional tuning.

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

*Last updated: April 2026*

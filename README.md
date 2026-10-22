# Debashish Paul — Enterprise Web Engineering & Flagship SaaS Portfolio

[![Live Production](https://img.shields.io/badge/Live-debashishpaul.in-0ea5e9?style=for-the-badge&logo=googlechrome&logoColor=white)](https://www.debashishpaul.in/)
[![Dual-Device Sandbox](https://img.shields.io/badge/DineFlow_Sandbox-Live_Demo-E5A93C?style=for-the-badge&logo=fastapi&logoColor=white)](https://www.debashishpaul.in/dineflow/?view=demo)
[![Rating](https://img.shields.io/badge/Client_Rating-5.0_★_(47_Reviews)-ffd700?style=for-the-badge)](https://www.debashishpaul.in/)
[![Architecture](https://img.shields.io/badge/Tech_Stack-Vanilla_HTML5_•_CSS3_•_ES6+-6366f1?style=for-the-badge)](https://www.debashishpaul.in/)

A high-performance personal portfolio, client showcase, and commercial SaaS platform engineered by **Debashish Paul**, Senior Software Engineer at **TATA Consultancy Services (TCS)** (Ex-Software Engineer at **Wipro Technologies**).

Built entirely with zero heavy frontend framework dependencies—delivering lightning-fast load times, 60 FPS hardware-accelerated animations, production-grade SaaS prototypes, and comprehensive enterprise SEO infrastructure.

---

## 📑 Table of Contents

- [Live Ecosystem](#-live-ecosystem)
- [Key Architectural Highlights](#-key-architectural-highlights)
  - [1. 3D Canvas Interactive Scroll Engine](#1-3d-canvas-interactive-scroll-engine)
  - [2. DineFlow™ QR Restaurant SaaS Platform & Dual-Device Sandbox](#2-dineflow-qr-restaurant-saas-platform--dual-device-sandbox)
  - [3. Automated Lead Capture & CRM Pipeline](#3-automated-lead-capture--crm-pipeline)
  - [4. Search Engine Optimization & Structured Data (SEO)](#4-search-engine-optimization--structured-data-seo)
  - [5. Ultra-Responsive Glassmorphism Design System](#5-ultra-responsive-glassmorphism-design-system)
- [Repository Structure](#-repository-structure)
- [Tech Stack & Engineering Standards](#-tech-stack--engineering-standards)
- [Deployment](#-deployment)
- [Author & Contact](#-author--contact)
- [License](#-license)

---

## 🌐 Live Ecosystem

| Platform / Experience | URL Route | Description |
| :--- | :--- | :--- |
| **Main Portfolio Hub** | [`/`](https://www.debashishpaul.in/) | Interactive 3D canvas hero, featured projects, client proof, and consulting inquiry form. |
| **DineFlow™ SaaS Hub** | [`/dineflow/`](https://www.debashishpaul.in/dineflow/) | Production QR restaurant platform, interactive ROI financial calculator, and lead intake. |
| **Dual-Device Operations Sandbox** | [`/dineflow/?view=demo`](https://www.debashishpaul.in/dineflow/?view=demo) | Side-by-side live simulator syncing an iPhone 16 Pro diner view with a Kitchen KDS Kanban. |
| **About Debashish** | [`/about/`](https://www.debashishpaul.in/about/) | Career journey, core engineering philosophy, tech stack proficiencies, and credentials. |
| **Engineering Services** | [`/services/`](https://www.debashishpaul.in/services/) | Full-stack engineering, performance audits, enterprise web architecture, and UI/UX solutions. |
| **Project Directory** | [`/projects/`](https://www.debashishpaul.in/projects/) | Detailed case studies spanning enterprise SaaS, 3D web experiences, and high-conversion portals. |
| **Testimonials & Client Proof** | [`/testimonials/`](https://www.debashishpaul.in/testimonials/) | Verified enterprise reviews, project outcomes, delivery metrics, and client endorsements. |
| **Consultation & Inquiries** | [`/contact/`](https://www.debashishpaul.in/contact/) | Direct inquiry intake pipeline with dynamic currency selection, country dial codes, and file upload. |

---

## 🌟 Key Architectural Highlights

### 1. 3D Canvas Interactive Scroll Engine
- **Hardware-Accelerated Frame Playback**: Utilizes an HTML5 2D Canvas rendering pipeline playing 240 high-definition photorealistic frames synchronized with window scroll delta.
- **Sub-Pixel LERP Physics**: Linear interpolation (`LERP`) smoothing ensures buttery fluid motion even during aggressive user scrolling.
- **Smart Staged Preloader**: Rapid initial unlock on critical-batch frames, followed by background streaming during browser idle time (`requestIdleCallback`) to minimize Time-to-Interactive (TTI).
- **Graceful Degradation**: Nearest-neighbor frame fallback mechanism prevents blank frames on variable network connections.

### 2. DineFlow™ QR Restaurant SaaS Platform & Dual-Device Sandbox
- **Zero-Install Contactless Dining**: Guests scan dynamic QR table tents to browse digital visual menus, customize spice/allergy options, and place orders directly from their smartphone.
- **Dual-Device Real-Time Sandbox (`/dineflow/?view=demo`)**:
  - Implements the browser's native `BroadcastChannel` API to establish zero-server-lag inter-frame event streaming.
  - Places an **iPhone 16 Pro Guest Simulator** alongside a **Kitchen KDS Kanban Dashboard** on a single viewport.
  - Orders placed on the guest mobile immediately ring the kitchen station with realistic audio chimes and dispatch live tickets.
- **5-Stage Live Order Tracker**: Real-time order lifecycle visualization (Placed → Kitchen Received → Preparing → Cooking → Plated → Served).
- **Dynamic Table Tent Stand Generator**: Generates customized, high-resolution printable acrylic table tent mockups embedded with dynamic table QR codes.
- **Operator Financial ROI Calculator**: Computes estimated labor hours saved, table turnover velocity gains (+31%), and elimination of 25% third-party aggregator commissions.

### 3. Automated Lead Capture & CRM Pipeline
- **Smart Inquiry Form**: Features real-time international phone code resolution for 240+ countries with SVG country flag badges and contextual budget currency selectors (₹ INR, $ USD, € EUR, £ GBP, etc.).
- **Serverless Google Apps Script Backend (`google_apps_script.js`)**:
  - Captures form submissions over cross-origin asynchronous `POST`.
  - Appends categorized inquiry metadata into Google Sheets for CRM tracking.
  - Automatically receives binary file attachments (PDF, DOCX, ZIP, images), stores them in a dedicated Google Drive folder, generates secure preview URLs, and inserts them into the sheet.
  - Dispatches instant, formatted HTML alert notifications to Gmail.

### 4. Search Engine Optimization & Structured Data (SEO)
- **Deep Schema.org JSON-LD Graph**:
  - `Person`: Documents Debashish Paul, professional roles, skills, and social profiles.
  - `ProfessionalService` (`Admirers Creation – AI & Digital Solutions`): Local/global agency metadata with geo-targeting coordinates.
  - `WebApplication`: Full software application schema for the DineFlow™ SaaS platform.
  - `AggregateRating`: 5.0 ⭐ rating based on 47 verified client reviews.
- **Multi-Search Engine Verification**: Google Search Console verification tags alongside Bing Webmaster authentication via [`BingSiteAuth.xml`](BingSiteAuth.xml).
- **Complete Crawl Topology**: Fully configured [`sitemap.xml`](sitemap.xml) with priority and frequency directives, paired with an optimized [`robots.txt`](robots.txt).
- **Rich Social Previews**: Open Graph and Twitter Card tags configured with 1200×630 high-impact image previews.

### 5. Ultra-Responsive Glassmorphism Design System
- **Pure Vanilla CSS Architecture**: Hand-crafted CSS design system without heavyweight utility or component frameworks.
- **CSS Custom Properties**: Centralized design tokens for colors, elevation, transitions, and typography.
- **Fluid Typography & Responsive Spacing**: Built with `clamp()` font scaling and CSS Grid/Flexbox layouts that prevent container overspill and awkward text wrapping from 320px smartphones to 4K monitors.
- **Accessibility & Compliance**: Semantic HTML5 tags, ARIA attributes, keyboard-navigable modals, and compliant Privacy Policy and Terms of Service dialogs.

---

## 📂 Repository Structure

```plaintext
Animated Portfolio website/
├── index.html                 # Main portfolio homepage (3D canvas, flagship SaaS card, showcase)
├── style.css                  # Core CSS design system, responsive rules, glassmorphism tokens
├── main.js                    # Canvas LERP scroll engine, lazy loading, modal controllers
├── sitemap.xml                # Comprehensive XML sitemap for Google, Bing & search engines
├── robots.txt                 # Search engine spider directives pointing to sitemap.xml
├── BingSiteAuth.xml           # Bing Webmaster Tools site verification key
├── CNAME                      # Custom domain mapping (debashishpaul.in)
├── serve.ps1                  # Zero-dependency PowerShell HTTP local development server
├── google_apps_script.js      # Production Google Apps Script backend for Google Sheets CRM & Gmail
├── site.webmanifest           # PWA web manifest specification
│
├── dineflow/                  # Flagship SaaS Platform — DineFlow™
│   ├── index.html             # SaaS showcase landing page & interactive ROI calculator
│   ├── demo.html              # Live Dual-Device Sandbox (iPhone 16 Pro + Kitchen KDS Kanban)
│   ├── style.css              # Dedicated DineFlow styling & responsive layouts
│   ├── app.js                 # Multi-tenant logic, table ordering, and state persistence
│   ├── data.js                # Menu database, category taxonomies, and item pricing
│   ├── pos.html               # Operator billing & table layout management portal
│   └── kds.html               # Back-of-house Kitchen Display System screen
│
├── about/                     # Dedicated SEO Hub: About Debashish Paul
│   └── index.html
├── services/                  # Dedicated SEO Hub: Engineering & Consulting Services
│   └── index.html
├── projects/                  # Dedicated SEO Hub: Detailed Engineering Project Directory
│   └── index.html
├── testimonials/              # Dedicated SEO Hub: Client Endorsements & Review Metrics
│   └── index.html
├── contact/                   # Dedicated SEO Hub: Project Intake & Consultation Form
│   └── index.html
│
├── nexus-engineering/         # Client Showcase: Industrial Engineering Platform
├── sterling-vance/            # Client Showcase: Luxury Architectural & Interior Design Agency
├── leaf-and-life/             # Client Showcase: Eco-Conscious Organic Lifestyle Showcase
├── across-the-street/         # Client Showcase: Boutique Hospitality & Cafe Showcase
│
├── assets/                    # Media assets, icons, video previews, and Open Graph previews
└── frames/                    # 240 high-definition frames powering the 3D scroll animation
```

---

## 🛠️ Tech Stack & Engineering Standards

- **Core Frontend**: Semantic HTML5, Vanilla JavaScript (ES6+), Modern CSS3 (Grid, Flexbox, Custom Properties)
- **Animation & Physics**: HTML5 2D Canvas Context, Frame-by-Frame LERP Scroll Math, CSS GPU-accelerated transforms
- **Real-Time Cross-Frame Sync**: Native Browser `BroadcastChannel` API
- **Backend & Automation**: Google Apps Script (V8 Runtime), Google Sheets API, Google Drive API, Gmail API
- **SEO & Semantics**: Schema.org JSON-LD Graph, Google Webmaster Tools, Bing Webmaster Tools, Canonical routing
- **PWA Capabilities**: Web App Manifest (`site.webmanifest`), Apple touch icons, theme-color status bar controls

---

## 🚢 Deployment

- **Custom Domain**: Bound to [`https://www.debashishpaul.in`](https://www.debashishpaul.in) via [`CNAME`](CNAME).
- **Edge CDN Hosting**: Fully configured for static deployment on **Vercel** via [`vercel.json`](vercel.json) with custom header caching directives and clean URL rewrites, or **GitHub Pages**.

---

## 👨‍💻 Author & Contact

**Debashish Paul**  
*Senior Software Engineer at TATA Consultancy Services (TCS)*  
*Ex-Software Engineer at Wipro Technologies*  
*Founder & Lead Architect at Admirers Creation*

- 🌐 **Portfolio**: [debashishpaul.in](https://www.debashishpaul.in)
- 💼 **LinkedIn**: [linkedin.com/in/debashishpaul24](https://www.linkedin.com/in/debashishpaul24/)
- 🐙 **GitHub**: [github.com/Debashishpaul24](https://github.com/Debashishpaul24)
- 💬 **WhatsApp**: [+91 99056 08257](https://wa.me/919905608257)
- 📧 **Email**: [pauldebashish115@gmail.com](mailto:pauldebashish115@gmail.com)

---

## 📄 License

© 2026 Debashish Paul. All Rights Reserved.  
Commercial platform prototypes (DineFlow™) and client showcase designs are proprietary creations of Debashish Paul.

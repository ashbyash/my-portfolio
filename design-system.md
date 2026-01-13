# 🎨 Visual & UI Design System (Hybrid Guide)

## 🏛 Base Reference (Original Fork)
- **Inherit Framework**: Keep the overall CSS/JS structure of the `vcard-personal-portfolio` template.
- **Sidebar & Layout**: Maintain the original sticky sidebar and general card-based design.
- **Animations**: Preserve the smooth transition effects and hover animations of the original.

## 🛠 Strategic Modifications (The "Vibe" Change)
- **Layout Shift**: Convert the multi-tab navigation into a **Single-Page Scroll (One-Pager)**. All sections should stack vertically.
- **Theme Deepening**: Use a more premium dark theme. 
  - Change BG to `#121212` and Card BG to `#1e1e1f`.
  - Replace the default orange accent with **`#ffdb70` (Gold/Yellow)** for a more sophisticated "Senior" look.
- **Navbar Behavior**: Change `data-nav-link` logic to **Anchor Links (`#id`)**. Ensure the navbar stays fixed or visible during scroll.

## ✨ Content-UI Harmony
- **Impact Highlighting**: Use the accent color (`#ffdb70`) specifically for numbers and metrics (%, $, etc.) found in the JSON data.
- **Typography**: Keep the original font families but increase line-height for better readability in the long-form "Lesson Learned" sections.
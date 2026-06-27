---
name: VerificaVzla Design System
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#444651'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#757682'
  outline-variant: '#c5c5d3'
  surface-tint: '#4059aa'
  primary: '#00236f'
  on-primary: '#ffffff'
  primary-container: '#1e3a8a'
  on-primary-container: '#90a8ff'
  inverse-primary: '#b6c4ff'
  secondary: '#0058be'
  on-secondary: '#ffffff'
  secondary-container: '#2170e4'
  on-secondary-container: '#fefcff'
  tertiary: '#1b2b3f'
  on-tertiary: '#ffffff'
  tertiary-container: '#314156'
  on-tertiary-container: '#9dadc6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b6c4ff'
  on-primary-fixed: '#00164e'
  on-primary-fixed-variant: '#264191'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#d3e4fe'
  tertiary-fixed-dim: '#b7c8e1'
  on-tertiary-fixed: '#0b1c30'
  on-tertiary-fixed-variant: '#38485d'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Chivo
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Chivo
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Chivo
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-sm:
    fontFamily: Chivo
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
  body-lg:
    fontFamily: Source Sans 3
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Source Sans 3
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Source Sans 3
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: IBM Plex Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  container-max: 1120px
  gutter: 24px
---

## Brand & Style

The design system is engineered for high-stakes information delivery, specifically tailored for fact-checking and news verification in the Venezuelan context. The brand personality is **authoritative, objective, and resilient**, aiming to provide a sense of stability and truth in a complex information landscape. 

The visual style is **refined Minimalism with a heavy focus on Information Architecture**. It avoids decorative flourishes to ensure that the content—the verified fact—remains the sole focus. By utilizing a "Newsroom Modern" aesthetic, the system balances the urgency of breaking news with the calculated calm of a professional verification laboratory. The UI evokes an emotional response of security and clarity through structured layouts and a disciplined color application.

## Colors

This design system utilizes a structured blue-based palette to reinforce institutional trust. 

- **Primary (#1E3A8A):** Used for global navigation, primary headings, and heavy UI anchors. It represents the "Source of Truth."
- **Accent (#3B82F6):** Reserved for interactive elements, links, and high-priority action buttons. It provides the necessary vibrancy to guide user flow.
- **Background Subtle (#F8FAFC):** The primary canvas color. It is a "cool" white that reduces eye strain during long-form reading while maintaining a clinical, clean feel.
- **Text Muted (#64748B):** Used for metadata, captions, and secondary information to maintain a clear visual hierarchy.

Semantic colors for verification status (True, False, Misleading) are used sparingly but with high saturation to ensure instant recognition of a fact-check result.

## Typography

The typography strategy prioritizes rapid legibility and editorial authority.

- **Headlines (Chivo):** A sharp, modern sans-serif that conveys confidence and urgency. Use the heavy weights for news titles to create a strong "front-page" impact.
- **Body (Source Sans 3):** A highly legible humanist sans-serif optimized for long-form reading on digital screens. It feels neutral and objective, staying out of the way of the facts.
- **Labels (IBM Plex Sans):** Used for categorization, timestamps, and technical metadata. The systematic feel of Plex Sans adds a layer of "data-driven" credibility to the verification details.

Ensure that large display headings scale down for mobile devices to maintain readability without overwhelming the viewport.

## Layout & Spacing

This design system follows a **Fixed Grid** philosophy for desktop to maintain a structured, newspaper-like integrity, transitioning to a fluid model for mobile.

- **Desktop (1024px+):** A 12-column grid with a maximum container width of 1120px. Gutters are fixed at 24px to provide ample breathing room between information modules.
- **Tablet (768px - 1023px):** An 8-column fluid grid with 16px margins.
- **Mobile (Up to 767px):** A 4-column fluid grid. Spacing is tightened to 16px margins to maximize the real estate for text.

Vertical rhythm is based on a 4px baseline grid. Padding within cards and content sections should prioritize generous top/bottom margins (xl/40px) to separate different news stories or verification reports clearly.

## Elevation & Depth

To maintain a professional and flat editorial feel, this design system avoids heavy shadows. Instead, it uses **Tonal Layers and Low-Contrast Outlines**.

1.  **Level 0 (Base):** Background color `#F8FAFC`.
2.  **Level 1 (Cards):** Pure White `#FFFFFF` with a 1px solid border of `#E2E8F0`. No shadow is used here to keep the UI feeling "printed" and permanent.
3.  **Level 2 (Hover/Interactions):** A very soft, ambient shadow (0px 4px 12px rgba(30, 58, 138, 0.05)) to indicate interactivity without breaking the minimalist aesthetic.

Depth is primarily communicated through the layering of elements. Fact-check "Verdict" badges should appear to be physically placed on top of content cards, using slight color contrast rather than elevation to draw the eye.

## Shapes

The shape language is **Soft (0.25rem)**. 

While many modern apps use large radii for a friendly feel, this design system uses subtle rounding to maintain a serious, institutional tone.
- **Standard UI (Buttons, Inputs, Cards):** 4px (0.25rem) radius.
- **Large Components (Modals, Featured Hero):** 8px (0.5rem) radius.
- **Labels & Tags:** Can utilize 2px or 0px corners to emphasize a more "technical/official" document feel.

Consistent use of small radii creates a UI that feels contemporary yet grounded and stable.

## Components

### Buttons
- **Primary:** Solid `#1E3A8A` with white text. High-contrast, rectangular with 4px radius.
- **Secondary:** Outlined with `#3B82F6`. Used for secondary navigation or "Read More" actions.
- **Tertiary:** Text-only with an icon, using the primary navy color.

### Verification Cards
The core component of the system. Cards must have a white background, a light gray border, and a clear "Verdict Header" that uses semantic colors (Green/Red/Amber). Content within the card follows a strict hierarchy: Category Label > Title > Short Summary > Source Attribution.

### Chips & Tags
Used for "Topics" (e.g., #Economics, #Elections). These should be low-contrast (Light gray background with `#64748B` text) to ensure they don't compete with primary actions.

### Input Fields
Strictly rectangular with a 1px border. Focus state uses a 2px `#3B82F6` border. Use `label-caps` for field labels to maintain the professional, data-centric aesthetic.

### Verification Indicators
Distinctive "True/False" stamps. These should use heavy font weights and be accompanied by a clear icon (Checkmark, X, or Alert) to ensure accessibility for color-blind users.
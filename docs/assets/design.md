Design System Spec – JotPsych-inspired

1. Color Palette

Primary Gradient Background: deep purple → pink gradient (used in hero).

Primary Button / CTA: bright coral / pink-red (stands out against purple).

Text: mostly dark charcoal/black for body and headings.

Secondary backgrounds: white or very light grey blocks for content.

Accent: light purple / lavender for subtle UI elements.

Color Tokens:

--color-primary-start: #5a2d8c; /_ approximate deep purple _/
--color-primary-end: #e83f80; /_ approximate pink _/
--color-cta: #f25068; /_ coral _/
--color-text-primary: #1a1a1a; /_ near-black _/
--color-bg-light: #f8f8f8;
--color-accent-light: #cbb4e3; /_ light lavender _/

2. Typography

Use: Space Grotesk font from google fonts as primary font

Use: Wix Madefor Text from google fonts as secondary font

<style>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&family=Wix+Madefor+Text:ital,wght@0,400..800;1,400..800&display=swap');
</style>

fallback to Inter / Roboto / Open Sans.

Scale & Weights:

H1: ~2.5rem, 700, line-height ~1.2

H2: ~2rem, 600–700, line-height ~1.3

H3: ~1.5–1.75rem, 600, line-height ~1.4

Body Text (p): 1rem–1.125rem, 400, line-height ~1.6

Small Text / captions: 0.875rem, 400

3. Spacing & Layout

Use an 8px baseline grid for margins and paddings.

Container widths:

Full width for hero with gradient background.

Max-width for content around 1140px, center-aligned.

Vertical rhythm: generous padding-top/bottom around major sections (~64–96px).

4. Components

Buttons
Primary CTA: background --color-cta, white text, medium-large padding (e.g., 12px 24px), border-radius ~4px–6px.
States:

Hover: slightly darker shade of --color-cta, subtle shadow.

Active: slight inset or darker gradient.

Mobile: make design responsive and mobile friendly.


6. Interaction & Motion

Subtle fade or slide-in for elements as they enter viewport.

Hover states for links and buttons clearly differentiated.

Maintain consistent focus outlines for accessibility (e.g., 2px outline in bright coral or accent).

7. Accessibility

Ensure sufficient color contrast between text and background.

Button labels and forms are clearly labeled.

Responsive layout across devices (mobile-first approach).

8. Overall Visual Vibe / Tone

Professional, modern, trustworthy.

Tool-focused but approachable: clear hierarchy, clean layout, no clutter.

Emphasize efficiency and clarity: large headings, clear CTAs, whitespace to let content breathe.

Brand language: concise, benefit-driven messaging 

Do: 
1. Use bold typography and whitespace to direct attention.	
2. Keep CTA buttons prominent and consistent across pages.	
3. Use visual hierarchy in typography and spacing


Do NOT: 
1. Overcrowd the UI with too many small elements
2. Use random color shifts – stick to the palette
3. Lose readability by using low contrast text

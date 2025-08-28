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

5. Layout
At Follow main-design.png to understand the layout of the page. Page should consist 3 main components. The hero text that uses the hero-text component. it is described and specified in hero-text.md.  It should say "JotPsych x AD Challenge"
Then there should be a Record Button. it should follow the record-button.md instructions. Right above record button there should be a centered text and it should say Recording instance 1 (number) in secondary font right below it. Remove "Tip" text we don't need it. When click on the red circle record button it should say in actice state. 

 Under the record button there should be three  another secondary less visible buttons that one allows to pause the recording. The other allows to stop the recording. and finally another one that allows to add another recording.

Below Record button should be the "Text-shimmer" component specified in text-shimmer.md. It should Say "Generating..." while we're waiting for the API response. Note that even if backend fails there should be a lorem ipsum text generated with a message that backend failed but here's some placeholdertext.

Below Text shimmer there should be a list of AI summaries specified in a form of an expandable card component. AI Analysys result should be shown in a collapsable card. 

There should be a footer that says "Made with 🤖 by ad_underground" with a link to my github – https://github.com/adunderground

Use Background Cells component specified in backdrop.md for the background/backdrop component.


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

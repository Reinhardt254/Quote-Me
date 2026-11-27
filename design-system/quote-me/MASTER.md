# Quote-Me design system

Python search scripts were unavailable. This master file records the written UI/UX guidance applied to the project.

## Product

SaaS quote studio for creating, editing, and downloading quote posters.

## Colors (existing brand)

- Primary / CTA: `#FF5722` (orange)
- Secondary / brand green: green-400 → green-600
- Accent: yellow-400
- Ink: black / near-black
- Surfaces: white and soft gray

Mapped to shadcn semantic tokens in `styles/globals.css`.

## Style

Light SaaS shell: marketing top nav + hero, product dashboard with sidebar, dense admin tables. Prefer soft cards, clear hierarchy, and orange CTAs. Avoid purple/pink AI gradients.

## Typography

Geist / Inter sans for product UI. Large display headings on marketing hero.

## Layouts

- Marketing: hero, template strip, discover feed
- User studio: sidebar, quote editor with live preview
- Admin: quotes, templates, images

## Accessibility checklist

- cursor-pointer / clear click targets on interactive controls
- Focus rings via `ring` token
- Text contrast on orange primary with white foreground
- Responsive checks at 375 / 768 / 1024

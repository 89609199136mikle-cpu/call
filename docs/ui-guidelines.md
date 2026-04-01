CraneApp UI Guidelines - Pixel-Perfect Telegram Clone (390px Mobile-First)
================================================================================
Colors (Telegram 2026):
- Primary: #2AABEE (accent/send)
- Background: #0F0F10 (dark), #FFFFFF (light)
- Chat BG: #111214 / #EFEFEF
- Message In: #1C1D1F / #FFFFFF (radius 16px)
- Message Out: #2B5278 / #2AABEE (radius 16px)
- Sidebar: #1E1F22 / #F5F6F7
- Text: #FFFFFF / #000000 (14-16px SF Pro)

Spacing: 8px grid (4px micro)
- Padding: 12-16px sections, 8px elements
- Margins: 4-8px gaps
- Borders: 1px #374049 / #E1E5E9 (radius 10-16px)

Typography:
- Headlines: 17px bold (font-weight 600)
- Body: 15px regular (400), 14px small
- Time: 12px gray (#8E96A0 / #707579)
- Font: -apple-system, SF Pro, system-ui

Components:
- Avatar: 48px circle (#gradient blue-purple)
- Button: 48px height, radius 10px, #2AABEE fill
- Input: 48px, radius 10px, focus #2AABEE border
- Message Bubble: max 70% width, 10px padding, tail 4px
- TabBar: 56px height, icons 24px + label 10px

Animations (220ms ease-out):
- Send: scale 0.97 + opacity
- Menu: slide-up 8px
- Typing: 3 dots pulse 1s
- Reactions: pop + scale 1.2

Breakpoints:
- Mobile: 390px (iPhone 14)
- Tablet: 768px (split: sidebar 360px + chat)
- Desktop: 1280px (3-panel: left 360 + center + right)

Dark/Light: auto-detect + manual toggle
RTL: Ready (chat bubbles reverse)
Accessibility: VoiceOver, high-contrast, reduced-motion
PWA: Manifest + SW cache (offline read)

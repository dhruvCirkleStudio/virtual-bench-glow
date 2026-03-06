

# LawBlocks – 3D Virtual Courtroom Interface

## Overview
A browser-based virtual courtroom combining a 3D courtroom scene (React Three Fiber) with professional 2D control panels. Dark, glassy UI inspired by Bloomberg Terminal / Apple Vision aesthetics.

## Design System
- **Colors**: Dark charcoal background, gold accents (judge), deep blue (lawyers), white (litigants), gray (observers)
- **UI Style**: Glass-morphism panels with subtle glow effects, elegant typography
- **Theme**: Dark mode only, professional legal-tech aesthetic

## Page: Courtroom View (`/courtroom`)

### Top Bar – Court Info
- Sticky dark glass bar with: Case ID, hearing timer (counting up), court status badge (Live/Paused/Closed with colored dot), network quality indicator (signal bars), and "Exit Courtroom" button
- Subtle bottom border glow

### Center – 3D Courtroom Scene
- Built with React Three Fiber + Drei helpers
- Low-poly courtroom with: elevated judge bench (center), two lawyer tables (left/right), litigant seats beside lawyers, witness stand, public gallery rows, large evidence display screen, LawBlocks logo on the wall
- Avatars: Simple 3D figures auto-placed by role, with floating name labels + role badges above them
- Speaking indicator: Subtle gold/blue glow ring around active speaker's avatar, mic icon above
- Evidence screen in the 3D scene shows shared documents/images

### Left Panel – Participants (Collapsible)
- List of participants with avatar thumbnail, name, role badge (color-coded)
- Judge/admin sees controls per participant: mute, remove, grant speaking permission
- Collapse toggle to maximize courtroom view

### Right Panel – Evidence & Chat (Tabbed, Collapsible)
- **Evidence Tab**: Upload document, share screen, present PDF/image buttons. Active evidence shows preview thumbnail. Shared content appears on the 3D courtroom screen
- **Chat Tab**: Real-time message list with role-colored tags, timestamps, file attachment support. Input bar at bottom

### Bottom Control Bar
- Floating centered toolbar (glass style): Mic toggle, Camera toggle, Raise Hand, Share Screen, Toggle Chat, Toggle Participants, Settings gear
- Active states with glow effects

### Judge Control Panel
- Additional floating panel (top-right or draggable) visible only to judge role
- Buttons: Start Hearing, Pause Hearing, End Session, Mute All, Grant Speaking Permission dropdown
- Authoritative gold-accented design

## Pages & Routes
1. `/` – Landing/lobby (simple entry with case ID input and role selection for demo purposes)
2. `/courtroom` – Main courtroom interface

## Data & State
- All participant data, chat messages, evidence items managed with React state (mock data for MVP)
- No backend needed initially – everything is client-side with realistic mock data
- Role-based UI: Judge sees admin controls, lawyers see evidence upload, observers see read-only view

## Key Components
1. `CourtroomScene` – React Three Fiber 3D environment
2. `TopBar` – Court info and status
3. `ParticipantsPanel` – Left collapsible panel
4. `EvidenceChatPanel` – Right tabbed panel
5. `BottomControlBar` – Floating toolbar
6. `JudgeControlPanel` – Admin overlay
7. `Avatar3D` – 3D avatar with labels and glow effects
8. `LobbyPage` – Entry screen with role selection

## Performance
- Low-poly 3D geometry (boxes/cylinders for furniture, simple shapes for avatars)
- Max 20 avatar instances
- Panels use standard 2D React components (not 3D)
- Lazy loading for 3D scene


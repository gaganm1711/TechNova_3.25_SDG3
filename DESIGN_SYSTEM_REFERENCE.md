# Design System Reference

## Color Palette (CSS Variables)

### Primary Background
```css
--color-bg-dark: #0a0e27           /* Main page background */
--color-bg-darker: #050810         /* Darker sections */
--color-surface: #141829           /* Panel background */
--color-surface-hover: #1a1f3a     /* Hover state */
--color-border: #2a2f4a            /* Border color */
```

### Emergency & Alert Colors
```css
--color-emergency-red: #ff3d3d     /* Primary emergency color */
--color-emergency-red-bright: #ff5555  /* Hover state */
--color-alert-amber: #ffb800       /* Warning/caution */
```

### Status Colors
```css
--color-success-green: #00d968     /* Success/online */
--color-cyan-glow: #00d9ff         /* Active tracking */
--color-cyan-dark: #0098b2         /* Darker cyan */
--color-pulse-blue: #3d7fff        /* Info/pulse */
```

### Text Colors
```css
--color-text-primary: #e8eef7      /* Main text */
--color-text-secondary: #a0aac0    /* Secondary text */
--color-text-muted: #6b7590        /* Muted text */
--color-white: #f0f4f9             /* Bright white */
```

### Shadow & Glow Effects
```css
--shadow-glow-red: 0 0 30px rgba(255, 61, 61, 0.4);
--shadow-glow-cyan: 0 0 30px rgba(0, 217, 255, 0.3);
--shadow-glow-blue: 0 0 25px rgba(61, 127, 255, 0.2);
--shadow-border: 0 0 20px rgba(0, 217, 255, 0.15);
--shadow-elevation: 0 20px 60px rgba(0, 0, 0, 0.6);
```

## Typography Stack

```css
--font-primary: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', monospace;
--font-heading: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif;
```

## Button Styles

### Emergency Button (`.btn-emergency`)
- Background: `--color-emergency-red`
- Glow: `--shadow-glow-red`
- Text: White, UPPERCASE, 700 weight
- Padding: `var(--spacing-lg) var(--spacing-2xl)`
- Hover: Scale + increased glow
- Active: Scale down

### Primary Button (`.btn-primary`)
- Background: `--color-cyan-glow`
- Text Color: `--color-bg-dark`
- Glow: `--shadow-glow-cyan`
- Hover: Translate up + enhanced glow

### Secondary Button (`.btn-secondary`)
- Background: Transparent
- Border: `--color-cyan-glow`
- Hover: Inset glow + border glow

### Ghost Button (`.btn-ghost`)
- Background: Transparent
- Border: `--color-border`
- Hover: Border cyan + glow

## Animations

### Pulse Emergency
```css
@keyframes pulse-emergency {
  0%, 100% {
    box-shadow: var(--shadow-glow-red), inset 0 0 30px rgba(255, 61, 61, 0.2);
  }
  50% {
    box-shadow: var(--shadow-glow-red), inset 0 0 50px rgba(255, 61, 61, 0.4);
  }
}
```

### Pulse Cyan
```css
@keyframes pulse-cyan {
  0%, 100% {
    box-shadow: var(--shadow-glow-cyan), 0 0 20px rgba(0, 217, 255, 0.3);
  }
  50% {
    box-shadow: var(--shadow-glow-cyan), 0 0 40px rgba(0, 217, 255, 0.5);
  }
}
```

### Glow Text
```css
@keyframes glow-text {
  0%, 100% {
    text-shadow: 0 0 10px rgba(0, 217, 255, 0.5);
  }
  50% {
    text-shadow: 0 0 20px rgba(0, 217, 255, 0.8);
  }
}
```

## Component Patterns

### Panel (`.panel`)
```css
background: linear-gradient(135deg, var(--color-surface) 0%, var(--color-surface-hover) 100%);
border: 1px solid var(--color-border);
border-radius: var(--radius-lg);
padding: var(--spacing-xl);
backdrop-filter: blur(10px);
box-shadow: var(--shadow-elevation);
```

### Panel Variants
- `.panel-dark` - Darker background
- `.panel-alert` - Red border + glow (emergencies)
- `.panel-warning` - Amber border + glow (warnings)
- `.panel-success` - Green border + glow (success)

## Spacing Scale
```css
--spacing-xs: 0.25rem      (4px)
--spacing-sm: 0.5rem       (8px)
--spacing-md: 1rem         (16px)
--spacing-lg: 1.5rem       (24px)
--spacing-xl: 2rem         (32px)
--spacing-2xl: 3rem        (48px)
```

## Border Radius
```css
--radius-sm: 4px
--radius-md: 8px
--radius-lg: 12px
--radius-xl: 16px
```

## Z-Index Hierarchy
```css
--z-base: 1
--z-dropdown: 100
--z-modal: 1000
--z-tooltip: 1100
```

## How to Use in React Components

### Using CSS Variables in Inline Styles
```jsx
<div style={{ color: 'var(--color-cyan-glow)' }}>
  Active Status
</div>
```

### Using Tailwind with CSS Variables
```jsx
<button className="btn btn-emergency">
  🚨 SUBMIT EMERGENCY
</button>
```

### Using Animations with Framer Motion
```jsx
<motion.div
  animate={{
    boxShadow: 'var(--shadow-glow-red)',
  }}
  className="animate-pulse-emergency"
>
  Critical Alert
</motion.div>
```

## Visual Hierarchy

### By Importance
1. **Critical**: Red glow + pulsing animation
2. **High**: Cyan glow + bright color
3. **Medium**: Amber/yellow + static glow
4. **Low**: Default border + no glow
5. **Muted**: Secondary text + faded color

### By Attention
- Pulsing = Immediate action needed
- Glowing = Active/important
- Border = Neutral/informational
- Muted = Background info

## Accessibility Notes

- ✓ Dark theme reduces eye strain
- ✓ High contrast (18:1+) meets WCAG AAA
- ✓ Color + icon redundancy (not color-only)
- ✓ Clear focus states with cyan glow
- ✓ Monospace for critical numbers (readability)

## Mobile Responsiveness

- Grid layouts use `grid-cols-2` to `grid-cols-3`
- Stacks to single column on mobile (`sm:` breakpoints)
- Buttons scale to `min-h-12` for touch targets
- Map height adjusts with viewport

## Performance Optimization

- CSS variables = no JS runtime calculation
- Animations use `transform` + `opacity` (GPU accelerated)
- Backdrop-filter has graceful fallback
- Glow effects use box-shadow (efficient)
- Grid overlay is CSS pattern (no images)

---

**Last Updated**: January 30, 2026
**Design System Version**: 1.0 (Command Center)
**Framework**: Tailwind CSS + CSS Variables + Framer Motion

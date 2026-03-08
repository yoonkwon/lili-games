# Game UI/UX Design Specifications for Children Ages 5-6

Compiled from industry research, Nielsen Norman Group studies, W3C guidelines, MIT Touch Lab data, and child development research.

---

## 1. Touch Target Sizes

Children ages 5-6 have developing fine motor skills and less precise finger control than adults.

| Element | Minimum Size | Recommended Size | Notes |
|---------|-------------|------------------|-------|
| Primary buttons (Play, Start) | 64x64 px | 80x80 px or larger | Main action buttons should dominate the screen |
| Secondary buttons | 56x56 px | 64x64 px | Settings, back, help |
| Interactive game objects | 60x60 px | 72x72 px | Draggable items, tappable characters |
| Spacing between targets | 12 px min | 16-20 px | Prevents accidental adjacent taps |
| Icon-only buttons | 60x60 px | 72x72 px | With visible hit area/background |

**Rationale:** Apple HIG recommends 44x44 px minimum for adults. MIT Touch Lab found adult fingertips are 16-20 mm wide. Children have smaller fingers but significantly less precision, so targets should be 1.5-2x the adult minimum. The adult thumb impact area averages 2.5 cm (roughly 72 px), which serves as a good baseline for children's primary touch targets.

**Key rule:** When in doubt, make it bigger. No child has ever complained that a button was too large.

---

## 2. Color Palette

### Primary Palette (High-saturation, warm-leaning)

| Color | Hex | Usage |
|-------|-----|-------|
| Bright Red | `#FF4444` | Alerts, stop/wrong feedback |
| Sunshine Yellow | `#FFD93D` | Stars, coins, highlights, rewards |
| Sky Blue | `#4FC3F7` | Backgrounds, calm areas, water |
| Grass Green | `#66BB6A` | Correct/go feedback, nature elements |
| Warm Orange | `#FFA726` | Energy, call-to-action buttons |
| Playful Purple | `#AB47BC` | Magic, special items |
| Soft Pink | `#F48FB1` | Decorative, character accents |

### Supporting Palette (Lower saturation for backgrounds/large areas)

| Color | Hex | Usage |
|-------|-----|-------|
| Cream White | `#FFF8E1` | Page/screen backgrounds |
| Soft Lavender | `#E8D5F5` | Secondary backgrounds |
| Pale Mint | `#E0F2F1` | Rest areas, calm zones |
| Warm Gray | `#F5F0EB` | Neutral containers |
| Deep Navy | `#1A237E` | Text on light backgrounds |

### Design Rules

- **Use warm colors** (reds, oranges, yellows) for interactive elements -- children prefer and respond to warm tones.
- **Use cooler, desaturated colors** for backgrounds to protect eyesight during extended play.
- **Red = wrong/stop, Green = correct/go** -- leverage universal color associations children already understand.
- **Maintain contrast ratio of 4.5:1 minimum** for any text, 3:1 for large text and UI components (WCAG AA).
- **Reduce brightness/purity** of large color areas to protect children's eyes.
- **Limit palette per screen** to 3-4 dominant colors to avoid visual overwhelm.

---

## 3. Typography

### Font Specifications

| Context | Font Size | Line Height | Weight |
|---------|-----------|-------------|--------|
| Game titles / Headers | 36-48 px | 1.3x | Bold / Extra Bold |
| Button labels | 28-36 px | 1.2x | Bold |
| Instructions (with audio) | 24-32 px | 1.4x | Medium / Semi-Bold |
| In-game numbers/scores | 32-40 px | 1.2x | Bold |
| Smallest permissible text | 24 px | 1.4x | Medium |

### Font Selection Criteria

- **Use rounded sans-serif typefaces** (e.g., Nunito, Baloo, Sassoon, Gill Sans Infant, ABeeZee).
- **Select fonts with infant characters**: one-story 'a' and 'g' letterforms, which match what children learn to write.
- **Large x-height** fonts improve readability for emerging readers.
- **Generous letter-spacing** (tracking): add 2-5% extra spacing between characters.
- **Well-defined contours**: avoid thin strokes or overly decorative fonts.
- **Test on target devices**: legibility on tablets at arm's length differs from desktop.

### Critical Rules

- Text should ALWAYS be accompanied by audio narration for ages 5-6.
- Never rely on text alone for instructions or navigation.
- Keep text strings short: 3-5 words maximum for UI labels.
- Use high contrast between text and background; avoid text over busy/textured backgrounds.

---

## 4. Icons vs. Text

### Core Principle: "Show, Don't Tell"

Pre-literate and early-literate children (ages 5-6) experience text as visual noise. Design must function with zero reading required.

### Icon Design Specifications

| Specification | Value |
|--------------|-------|
| Minimum icon size | 60x60 px |
| Recommended icon size | 72-80 px |
| Icon stroke width | 3-4 px minimum |
| Icon style | Filled rather than outline-only |
| Icon + label approach | Icon primary, text secondary (optional) |

### Icon Design Rules

1. **Use real-world metaphors**: A house icon for "home," a door icon for "exit," a gear for "settings" only if paired with a parent-gate.
2. **Test icon comprehension** with actual 5-6 year olds -- icons obvious to adults may be meaningless to children.
3. **Pair icons with color coding**: Each section/action gets a consistent color.
4. **Add audio labels**: When a child hovers/long-presses an icon, play an audio label ("Play!", "Go back").
5. **Avoid abstract icons**: hamburger menus, ellipsis menus, and share icons are not understood by this age group.
6. **Use character guides**: A friendly character pointing or gesturing is more effective than any icon for navigation cues.

### Navigation Pattern

- Replace text menus with **large pictorial buttons**.
- Limit choices to **3-5 options per screen**.
- Use a **persistent, visible "home" button** with a recognizable icon (house shape).
- **Avoid hidden navigation** (swipe gestures, pull-down menus, side drawers) -- children expect visible, tappable elements.

---

## 5. Animation Speeds

### Timing Specifications

| Animation Type | Duration | Easing |
|---------------|----------|--------|
| Button press feedback | 100-150 ms | ease-out |
| Screen transitions | 400-600 ms | ease-in-out |
| Element appearing/fading in | 300-500 ms | ease-out |
| Reward/celebration animation | 1.5-3.0 sec | custom/bounce |
| Character reaction | 500-800 ms | ease-in-out |
| Progress bar fill | 800-1200 ms | ease-out |
| Error/wrong answer shake | 300-500 ms | ease-in-out |
| Idle animation loop | 2-4 sec per cycle | linear |

### Animation Design Rules

- **Slower than adult UI**: Children process visual information more slowly. Add 30-50% to standard adult animation durations.
- **Avoid fast-paced sequences**: Research shows children who watch fast-paced content have significantly lower persistence in subsequent cognitive tasks.
- **Reward animations can be longer**: 1.5-3 seconds is appropriate for celebration effects (confetti, stars, character dance). These are the payoff moment.
- **Keep functional animations quick**: Button feedback and navigation transitions should still feel responsive (under 600 ms).
- **Use anticipation and follow-through**: Cartoon-style animation principles (squash, stretch, overshoot) feel natural and delightful to children.
- **Avoid flashing**: Never flash content more than 3 times per second (WCAG requirement; also important for photosensitive children).
- **Provide motion settings**: Allow parents to reduce or disable animations in settings.

---

## 6. Sound Design Principles

### Audio Specifications

| Sound Type | Duration | Volume (relative) | Notes |
|-----------|----------|--------------------|-------|
| Button tap feedback | 50-150 ms | 60-70% | Short, satisfying click/pop |
| Correct answer | 500-1000 ms | 80% | Ascending tone, cheerful chime |
| Wrong answer | 300-500 ms | 50-60% | Soft, gentle "try again" tone -- never harsh |
| Reward fanfare | 1.5-3 sec | 85% | Celebratory, musical |
| Background music | Looping | 30-40% | Beneath all other audio |
| Voice narration | Variable | 100% | Always clearest element in mix |
| Ambient/environmental | Looping | 20-30% | Nature sounds, gentle textures |

### Sound Design Rules

1. **Sound is the primary feedback channel** for this age group -- more important than visual text feedback.
2. **Never use harsh, loud, or scary sounds** for negative feedback. A gentle "boop" or sympathetic character voice ("Oops, try again!") is appropriate.
3. **Voice guidance replaces written instructions**: Use a warm, friendly, age-appropriate voice for all onboarding, tooltips, and error messages.
4. **Distinct sound signatures**: Each action type should have a unique, learnable sound so children develop audio-spatial memory.
5. **Layer audio carefully**: Voice narration > Sound effects > Background music in priority.
6. **Allow parents to control volume** per channel (music, effects, voice) independently.
7. **Keep background music simple**: Repetitive but pleasant melodic loops; avoid complex or dissonant compositions.
8. **Use rising pitch patterns** for positive progress (each successive correct answer slightly higher in pitch).
9. **Test at low volume**: Designs must remain comprehensible when parents turn the volume down.
10. **Provide a mute option** that is accessible to parents but not trivially toggled by children.

---

## 7. Feedback and Reward Patterns

### Reward Timing

| Event | Response Time | Feedback Type |
|-------|--------------|---------------|
| Correct answer | Immediate (< 200 ms) | Sound + visual animation + character reaction |
| Wrong answer | Immediate (< 200 ms) | Gentle sound + subtle visual + encouragement |
| Level completion | 0-500 ms after last action | Full celebration: confetti, stars, character dance, fanfare |
| Milestone (e.g., 5 in a row) | Immediate | Special animation + unique sound + collectible reward |
| Session end | After natural stopping point | Summary of achievements, sticker/badge |

### Reward Types and Specifications

| Reward Type | Implementation | Effectiveness |
|-------------|---------------|---------------|
| Stars/coins | Animated collection into a visible counter | High -- tangible accumulation |
| Stickers/badges | Unlockable, viewable in a collection screen | High -- sense of completion |
| Character reactions | Avatar celebrates, dances, gives thumbs up | Very high -- emotional connection |
| Progress visualization | Fill a jar, build a scene, grow a plant | High -- ongoing motivation |
| Unlockable content | New characters, colors, tools, levels | High -- intrinsic motivation |

### Critical Design Rules

1. **No punishment, only encouragement**: Wrong answers should never subtract points or show negative imagery. Use "Not quite! Try again!" with a gentle animation.
2. **Celebrate effort, not just accuracy**: Reward trying ("Great job trying!") even when incorrect.
3. **Immediate feedback is non-negotiable**: Children ages 5-6 cannot connect delayed feedback to their action. Response must be < 200 ms.
4. **Use multi-sensory feedback**: Combine visual + audio + haptic (device vibration) for maximum impact.
5. **Variable reward schedules**: Mix predictable rewards (every correct answer) with surprise bonuses (random extra stars) to maintain engagement.
6. **Keep sessions short**: Design for 8-10 minute play sessions. Provide natural stopping points with a sense of accomplishment.
7. **Show cumulative progress**: Let children see their total stars, completed stickers, etc. Tangible accumulation is highly motivating.
8. **Avoid competitive leaderboards**: At age 5-6, comparison with others can be demotivating. Focus on personal progress.

---

## 8. Screen Layout

### Layout Zones (for tablet in landscape orientation)

```
+--------------------------------------------------+
|  [Back/Home]          [Title Area]    [Settings*] |  <- Top Bar: 60-80 px tall
|                                                    |
|                                                    |
|              MAIN INTERACTION ZONE                 |  <- Center: Primary content
|                 (largest area)                     |     and game play area
|                                                    |
|                                                    |
|  [Helper/     +-----------------------+  [Helper/  |
|   Hint]       | PRIMARY ACTION AREA   |   Character|  <- Bottom third: most
|               | (big buttons here)    |            |     accessible zone
|               +-----------------------+            |
+--------------------------------------------------+
                                                     * Settings behind parent gate
```

### Zone Specifications

| Zone | Position | Content Priority | Notes |
|------|----------|-----------------|-------|
| Bottom center | Most accessible | Primary actions, main game buttons | Children naturally reach here first |
| Center screen | Easy reach | Game content, interactive elements | Visual focus area |
| Top bar | Harder to reach | Navigation, non-critical info | Keep thin (60-80 px); back/home buttons here are acceptable since they are less frequently used |
| Corners | Hardest to reach | Parent gates, settings | Intentionally hard for children to access |
| Bottom edge | Accidental touch zone | AVOID placing buttons here | Risk of accidental swipes/home gestures |

### Layout Rules

1. **Center-weighted design**: Place the most important interactive elements in the center and lower-center of the screen.
2. **Avoid edges and corners** for child-facing interactions -- these are harder for small hands to reach and prone to accidental OS gestures.
3. **Maximum 3-5 interactive elements** per screen to prevent choice paralysis.
4. **Use generous padding**: Minimum 20 px between any interactive elements; 32 px preferred.
5. **Full-screen design**: Avoid scrolling entirely. All content for a given screen should be visible at once.
6. **Consistent layout across screens**: Navigation elements (back, home) should always be in the same position.
7. **Visual hierarchy through size**: The most important element should be 2-3x the size of secondary elements.
8. **Safe zones**: Keep interactive content at least 40 px from screen edges to avoid OS gesture conflicts.

### Orientation

- **Lock to landscape** for tablet games (wider play area, natural holding position).
- **Lock to portrait** if designed for phone (easier one-hand grip for small hands being held by a parent).
- **Never allow rotation** during gameplay -- disorienting for young children.

---

## 9. Accessibility Considerations

### Motor Accessibility

| Guideline | Specification |
|-----------|--------------|
| Touch target size | 64 px minimum (see Section 1) |
| Touch-and-hold duration | 500 ms before triggering long-press actions |
| Drag distance threshold | Minimum 20 px movement before registering as a drag (not a tap) |
| Gesture complexity | Single tap and simple drag only -- no pinch, multi-finger, or swipe gestures |
| Error tolerance | Allow imprecise taps within a generous hit zone (extend 8-12 px beyond visual bounds) |
| Timeout | Never time out on input -- let children take as long as they need |

### Visual Accessibility

| Guideline | Specification |
|-----------|--------------|
| Color contrast (text) | 4.5:1 minimum (WCAG AA) |
| Color contrast (UI components) | 3:1 minimum |
| Never rely on color alone | Always pair color with shape, icon, or sound |
| Colorblind-safe feedback | Use shape + color: green checkmark for correct, red X for incorrect |
| Text scaling | Support system font size settings; test at 200% |
| Screen reader | Label all interactive elements with descriptive alt text |

### Cognitive Accessibility

| Guideline | Implementation |
|-----------|---------------|
| Reduce cognitive load | One task per screen; clear single objective |
| Predictable patterns | Consistent interaction patterns across the entire app |
| Forgiveness | Undo capability; no permanent consequences for wrong answers |
| Memory demands | Do not require children to remember information from a previous screen |
| Distraction control | Minimize decorative animations during active tasks |
| Clear state indicators | Make it obvious what is tappable (3D-style buttons, glow, bounce) |
| Progress saving | Auto-save frequently; children may close the app at any time |

### Auditory Accessibility

| Guideline | Implementation |
|-----------|---------------|
| Captions/visual alternatives | Provide visual equivalents for all audio cues |
| Visual narration indicator | Show a character "speaking" when audio plays |
| Volume control | Per-channel volume (music, effects, voice) accessible to parents |
| No audio-only instructions | Always pair audio with visual demonstration |

### Inclusive Design Additions

- **Left-handed support**: Do not assume right-hand dominance. Mirror layouts or center critical elements.
- **Support for assistive devices**: Ensure compatibility with switch access and external controllers.
- **Adjustable difficulty**: Allow parents to set difficulty levels appropriate for their child's abilities.
- **Sensory sensitivity mode**: Option to reduce visual intensity, disable haptics, and simplify backgrounds for children with sensory processing differences.
- **Parent/guardian controls**: Settings area behind a parent gate (e.g., solve a simple math problem, press-and-hold for 3 seconds, or read-and-enter a word).

---

## Quick Reference: Critical Numbers

| Parameter | Value |
|-----------|-------|
| Minimum touch target | 64x64 px |
| Recommended touch target | 72-80 px |
| Target spacing | 16-20 px |
| Minimum font size | 24 px |
| Recommended button label size | 28-36 px |
| Max choices per screen | 3-5 |
| Button feedback animation | 100-150 ms |
| Screen transition | 400-600 ms |
| Reward animation | 1.5-3.0 sec |
| Feedback response time | < 200 ms |
| Session length target | 8-10 minutes |
| Color contrast (text) | 4.5:1 |
| Edge safe zone | 40 px |
| Background music volume | 30-40% of max |

---

## Sources and References

Research compiled from Nielsen Norman Group, W3C WCAG 2.1/2.2, MIT Touch Lab, Apple HIG, Google Material Design, UXmatters, Game Accessibility Guidelines, and published child development studies.

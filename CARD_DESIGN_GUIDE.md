# 3D Metal Player Cards - Visual Guide

## Card Design Overview

Each card is a 3D extruded metal card with the following features:

```
┌──────────────────────┐
│                      │
│  LVL 3    [NAME]    │ ← Player Name (Bold, Uppercase)
│                      │
│        [GK]          │ ← Position Badge
│                      │
│  PAC 88    DEF 68   │
│  SHO 83    PHY 85   │ ← Six Stats (Engraved)
│  PAS 79    DRI 80   │
│                      │
│       ⭕ 85         │ ← Overall Rating (Large Circle)
│                      │
│     [LEGENDARY]      │ ← Rarity Badge
│                      │
│    ABC-L-0001       │ ← Serial Number
│                      │
└──────────────────────┘
```

## Rarity Visuals

### 1. Common (Silver) 🥈
- **Material**: Bright silver metallic
- **Properties**:
  - Metalness: 0.95
  - Roughness: 0.2
  - Emissive: Subtle gray glow
- **Visual**: Clean, professional, brushed metal look
- **Multiplier**: 1.0x (base stats)

### 2. Rare (Red) 🔴
- **Material**: Crimson red metallic
- **Properties**:
  - Metalness: 0.9
  - Roughness: 0.25
  - Emissive: Dark red glow
- **Visual**: Bold red with metallic sheen
- **Multiplier**: 1.1x (+10% stats)

### 3. Unique (Rainbow) 🌈
- **Material**: Animated rainbow shader
- **Properties**:
  - Metalness: 0.85
  - Dynamic color shifting
  - Time-based animation
- **Visual**: Spectral rainbow effect that shifts colors continuously
- **Special**: Custom shader with animated rainbow gradient
- **Multiplier**: 1.2x (+20% stats)

### 4. Epic (Black) ⚫
- **Material**: Deep black metallic
- **Properties**:
  - Metalness: 1.0 (maximum)
  - Roughness: 0.15 (very smooth)
  - Emissive: Dark gray highlights
- **Visual**: Sleek black chrome with mirror-like reflections
- **Multiplier**: 1.35x (+35% stats)

### 5. Legendary (Gold) 🏆
- **Material**: Brilliant gold metallic
- **Properties**:
  - Metalness: 1.0 (maximum)
  - Roughness: 0.1 (smoothest)
  - Emissive: Orange-gold glow
- **Visual**: Pure gold with maximum shine and reflections
- **Multiplier**: 1.5x (+50% stats)

## 3D Effects

### Card Geometry
- **Shape**: Rounded rectangle with beveled edges
- **Depth**: 0.08 units extruded
- **Bevel**: Smooth 0.03 unit bevel for rounded edges
- **Corners**: 0.15 unit radius for rounded corners

### Rotation & Animation
- **Base Rotation**: -5 degrees (tilted perspective)
- **Hover Effect**: Rotates +0.15 radians on Y-axis (smooth transition)
- **Floating**: Subtle up/down motion when not hovering
- **Transition**: Smooth 0.1 interpolation speed

### Lighting Setup
1. **Ambient Light**: Soft overall illumination (0.4 intensity)
2. **Directional Light**: Main light with shadows (1.5 intensity)
3. **Point Light**: Side highlight for depth (-5, 5, 5 position)
4. **Spotlight**: Dramatic top-down light (0.8 intensity)
5. **Environment**: HDR city environment for reflections

### Shadows
- **Contact Shadows**: Soft ground shadows for depth
- **Cast Shadows**: Cards cast shadows on the ground
- **Receive Shadows**: Cards receive shadows from lighting

## Text Engraving

All text is "engraved" into the card surface:
- **Font Weight**: Bold (700-900)
- **Color**: Black text on metallic surface
- **Outline**: White outline for contrast
- **Position**: Slightly elevated (z: 0.05-0.06)

### Text Elements:
1. **Player Name**: 0.25 font size, centered, top
2. **Position**: 0.18 font size, centered
3. **Stats**: 0.14 font size, two columns
4. **Rarity**: 0.16 font size, centered, bottom
5. **Overall**: 0.4 font size, in circle
6. **Level**: 0.12 font size, top-left corner (gold)
7. **Serial**: 0.1 font size, bottom

## Interactive Features

### Hover State
- Card rotates smoothly
- Lighting follows mouse
- Floating animation pauses
- Smooth spring-like transition

### Selection State
- 4px ring around card (ring-4 ring-primary)
- Rounded corners maintained
- Transition animation

## Technical Details

### Canvas Setup
- **Size**: Full container (min-height: 400px)
- **Camera**: Perspective at (0, 0, 6) with FOV 50
- **Renderer**: WebGL with shadows enabled

### Performance Optimization
- Memoized card shape geometry
- Efficient shader compilation
- Shadow map size: 1024×1024
- Anti-aliasing enabled

## Stat Calculation Example

For a player with base PAC of 80:

```
Rarity       Multiplier    Result
─────────────────────────────────
Common       1.0x          80
Rare         1.1x          88
Unique       1.2x          96
Epic         1.35x         108
Legendary    1.5x          120
```

All stats (PAC, SHO, PAS, DEF, PHY, DRI) are multiplied and rounded.

## Rainbow Shader (Unique Cards)

The rainbow effect is created using a custom GLSL shader:

```glsl
// Calculates angle from center
angle = atan(y, x)

// Creates rainbow gradient
rainbow = fract(angle / 2π + time * 0.2)

// Maps to 6 colors:
Red → Orange → Yellow → Green → Blue → Purple → Red

// Adds metallic shine based on surface normal
```

The result is a continuously animated rainbow that shifts colors over time.

## Implementation Files

- **Component**: `client/src/components/MetalPlayerCard.tsx`
- **Wrapper**: `client/src/components/PlayerCard.tsx`
- **Page**: `client/src/pages/collection.tsx`

## Usage Example

```tsx
import MetalPlayerCard from './components/MetalPlayerCard';

<MetalPlayerCard card={{
  id: 1,
  player: {
    name: "CRISTIANO RONALDO",
    position: "FWD",
    overall: 95
  },
  rarity: "legendary",
  level: 5,
  serialId: "CR7-L-0001",
  statMultiplier: 1.5
}} />
```

---

**Result**: A stunning 3D metal card that feels premium, interactive, and visually distinct based on rarity! 🎨✨

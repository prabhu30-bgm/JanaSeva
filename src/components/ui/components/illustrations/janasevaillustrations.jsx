import React from 'react';

/**
 * JanaSeva Official Brand Logo
 * Clean, lightweight, self-contained SVG emblem with dual teal leaves and saffron warmth.
 */
export function JanaSevaLogo({ size = 36, showTagline = true, color = 'var(--color-primary, #0F766E)', style = {} }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none', ...style }}>
      <img
        src="/logo.png"
        alt="JanaSeva Logo"
        width={size}
        height={size}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          objectFit: 'contain',
          borderRadius: '50%',
          flexShrink: 0
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span
          style={{
            fontSize: size >= 32 ? '22px' : '18px',
            fontWeight: 800,
            color,
            letterSpacing: '-0.02em',
            fontFamily: 'var(--font-family, Inter, sans-serif)'
          }}
        >
          JanaSeva
        </span>
        {showTagline && (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 500,
              color: 'var(--color-text-secondary, #4B5563)',
              marginTop: '3px',
              letterSpacing: '0.01em',
              lineHeight: 1.2
            }}
          >
            Together for a better tomorrow
          </span>
        )}
      </div>
    </div>
  );
}

export const JanaSevaLogoImg = '/logo.png';

/**
 * Hero Handover Illustration
 * Vector scene depicting compassionate community resource redistribution at a JanaSeva Point.
 */
export function HeroHandoverIllustration({ width = '100%', height = 'auto', style = {}, className = '', alt = 'JanaSeva Community Redistribution Handover' }) {
  return (
    <img
      src="/Hero.png"
      alt={alt}
      className={className}
      style={{
        width,
        height,
        maxWidth: '100%',
        objectFit: 'cover',
        borderRadius: '16px',
        display: 'block',
        ...style
      }}
    />
  );
}

export const HeroHandoverImg = '/Hero.png';

/**
 * Hands Holding Sapling / Leaves
 * Symbol of community nourishment & sustainable growth
 */
export function SaplingHandsIllustration({ size = 180, style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ ...style }}
      aria-label="Hands nurturing a growing green plant"
    >
      <circle cx="100" cy="100" r="95" fill="#E6F4F1" />
      <ellipse cx="100" cy="140" rx="50" ry="24" fill="#92400E" opacity="0.8" />
      <ellipse cx="100" cy="138" rx="44" ry="18" fill="#B45309" />
      <path d="M100 135 L 100 80" stroke="#047857" strokeWidth="6" strokeLinecap="round" />
      <path d="M100 95 Q 70 70 65 95 Q 85 110 100 95 Z" fill="#10B981" />
      <path d="M100 80 Q 130 55 135 80 Q 115 95 100 80 Z" fill="#059669" />
      <path d="M100 70 Q 100 45 115 55 Q 110 70 100 70 Z" fill="#34D399" />
      <path
        d="M45 140 Q 65 165 95 160 Q 98 152 92 144 Q 68 135 55 125 Z"
        fill="#FBBF24"
        stroke="#D97706"
        strokeWidth="2"
      />
      <path
        d="M155 140 Q 135 165 105 160 Q 102 152 108 144 Q 132 135 145 125 Z"
        fill="#FBBF24"
        stroke="#D97706"
        strokeWidth="2"
      />
    </svg>
  );
}

/**
 * Hands Holding Heart / Compassion Emblem
 */
export function HandsHeartIllustration({ size = 160, style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ ...style }}
      aria-label="Hands gently cradling a heart emblem"
    >
      <circle cx="80" cy="80" r="76" fill="#F0FDF4" />
      <path
        d="M80 108 C 45 80 40 55 58 42 C 72 32 80 46 80 46 C 80 46 88 32 102 42 C 120 55 115 80 80 108 Z"
        fill="#0F766E"
      />
      <circle cx="80" cy="62" r="10" fill="#F59E0B" />
      <path
        d="M32 105 Q 55 130 80 126 Q 78 116 70 110 Q 50 100 38 92 Z"
        fill="#FBBF24"
        opacity="0.9"
      />
      <path
        d="M128 105 Q 105 130 80 126 Q 82 116 90 110 Q 110 100 122 92 Z"
        fill="#FBBF24"
        opacity="0.9"
      />
    </svg>
  );
}

export default JanaSevaLogo;

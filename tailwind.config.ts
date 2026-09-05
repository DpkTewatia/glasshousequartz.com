import type { Config } from 'tailwindcss';

/**
 * Tailwind is the styling system. Bootstrap is loaded first (see layout.tsx)
 * and supplies Reboot — the single base reset — plus the behaviour of a few
 * interactive components (offcanvas, dropdown, collapse).
 *
 * Preflight is therefore OFF. Running Preflight and Reboot together is the
 * usual cause of Tailwind/Bootstrap projects fighting the cascade: both reset
 * the same elements, and whichever loads second silently wins. With one reset
 * and Tailwind utilities loading afterwards, utilities reliably override
 * Bootstrap component styles at equal specificity.
 */
const config: Config = {
  corePlugins: { preflight: false },
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // A gallery is neutral so the work supplies the colour. The glass is
        // teal, jade, purple and amber — the interface stays out of its way.
        ink: {
          DEFAULT: '#0B0B0C',
          900: '#131316',
          700: '#3A3A40',
          500: '#6B6B73',
          400: '#8E8E96',
          300: '#B4B4BB',
        },
        line: {
          DEFAULT: '#E6E6E8',
          soft: '#F0F0F1',
          strong: '#D3D3D7',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          sunk: '#FAFAFA',
          raised: '#F5F5F6',
        },
        quartz: '#14304A', // reserved for links, focus and quiet emphasis
        sale: '#9B2C2C',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
      },
      fontSize: {
        // Editorial scale: large headings run tight, small labels run wide.
        'display-xl': ['clamp(2.75rem, 7vw, 5.5rem)', { lineHeight: '0.95', letterSpacing: '-0.035em' }],
        'display-lg': ['clamp(2.25rem, 5vw, 4rem)', { lineHeight: '1.0', letterSpacing: '-0.03em' }],
        'display-md': ['clamp(1.75rem, 3.4vw, 2.75rem)', { lineHeight: '1.08', letterSpacing: '-0.022em' }],
        'display-sm': ['clamp(1.35rem, 2.2vw, 1.85rem)', { lineHeight: '1.18', letterSpacing: '-0.015em' }],
        label: ['0.6875rem', { lineHeight: '1', letterSpacing: '0.14em' }],
        'label-lg': ['0.75rem', { lineHeight: '1', letterSpacing: '0.12em' }],
      },
      maxWidth: {
        prose: '68ch',
      },
      spacing: {
        gutter: 'clamp(1.25rem, 4vw, 3.5rem)',
        band: 'clamp(3.5rem, 9vw, 8rem)',
      },
      transitionTimingFunction: {
        gallery: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
      },
      keyframes: {
        rise: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'none' },
        },
        fade: { from: { opacity: '0' }, to: { opacity: '1' } },
      },
      animation: {
        rise: 'rise 0.6s cubic-bezier(0.22, 0.61, 0.36, 1) both',
        fade: 'fade 0.4s ease both',
      },
    },
  },
  plugins: [],
};

export default config;

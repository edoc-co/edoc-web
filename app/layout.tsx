import type { Metadata } from 'next';
import { Archivo, Inter, Fraunces, Nunito, JetBrains_Mono, IBM_Plex_Mono } from 'next/font/google';
import WorldProvider from '@/lib/world/WorldProvider';
import ModeProvider from '@/lib/mode/ModeProvider';
import { noFlashWorldScript } from '@/lib/world/constants';
import { noFlashModeScript } from '@/lib/mode/constants';
import './globals.css';

// These load into "-src" variables, not the token names directly —
// styles/tokens.css composes --font-display etc. as
// `var(--font-display-src), 'Archivo', sans-serif`, so the design
// tokens stay the single source of truth and there's no cascade race
// between this file's :root rule and next/font's generated class.
//
// Forge's faces (Archivo/Inter) and Grove's (Fraunces/Nunito) both
// load unconditionally, up front — the world can switch mid-session
// (WORLDS.md §7) with no reload, so both identities' type must
// already be on the page before the switcher is ever touched.

// --font-display (Forge) — condensed/expanded heavy display type (boss names, zone titles, stats).
// Loaded as a true variable font (weight: 'variable') with the wdth axis
// included via `axes`, so .text-boss/.text-zone-title/.text-stat can set
// font-stretch and actually get a different width, not just a fixed cut.
const archivo = Archivo({
  variable: '--font-display-src',
  subsets: ['latin'],
  weight: 'variable',
  axes: ['wdth'],
});

// --font-ui (Forge) — body copy, buttons
const inter = Inter({
  variable: '--font-ui-src',
  subsets: ['latin'],
  weight: ['400', '500'],
});

// --font-display (Grove) — Fraunces, a variable serif with two named
// custom axes: SOFT (rounds the terminals) and WONK (lets the italic-ish
// alternates in, for a bit of hand-drawn character). Loaded alongside
// the opsz axis so text-boss-size display sizes get the display cut,
// not the text-optimized one. Actual axis *values* are tokens
// (--text-boss-variation etc. in styles/tokens.css), not set here —
// this only makes the axes available to set.
const fraunces = Fraunces({
  variable: '--font-display-grove-src',
  subsets: ['latin'],
  weight: 'variable',
  axes: ['SOFT', 'WONK', 'opsz'],
});

// --font-ui (Grove) — Nunito, rounded and friendly without tipping into childish.
const nunito = Nunito({
  variable: '--font-ui-grove-src',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

// --font-code — the user's code, in the editor. Never varies by world (WORLDS.md §5).
const jetbrainsMono = JetBrains_Mono({
  variable: '--font-code-src',
  subsets: ['latin'],
  weight: ['400', '700'],
});

// --font-hud — the machine's voice: labels, telemetry, the ticker. Never varies by world (WORLDS.md §5).
const ibmPlexMono = IBM_Plex_Mono({
  variable: '--font-hud-src',
  subsets: ['latin'],
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'edoc',
  description: 'Fight your way through the language you’re learning.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${inter.variable} ${fraunces.variable} ${nunito.variable} ${jetbrainsMono.variable} ${ibmPlexMono.variable} h-full antialiased`}
      // The no-flash scripts below set data-world/data-mode on the
      // client before React hydrates, and the server never renders
      // those attributes — an intentional, expected mismatch (the
      // standard pattern for avoiding a flash of the wrong world/mode),
      // not a real bug.
      suppressHydrationWarning
    >
      <head>
        {/* Blocking (no async/defer) so data-world/data-mode are set
            before first paint — no flash of the wrong world or mode.
            Reads localStorage directly; WorldProvider/ModeProvider pick
            up whatever these set. */}
        <script dangerouslySetInnerHTML={{ __html: noFlashWorldScript() }} />
        <script dangerouslySetInnerHTML={{ __html: noFlashModeScript() }} />
      </head>
      <body className="min-h-full flex flex-col bg-void text-text-hi font-ui">
        <WorldProvider>
          <ModeProvider>{children}</ModeProvider>
        </WorldProvider>
      </body>
    </html>
  );
}

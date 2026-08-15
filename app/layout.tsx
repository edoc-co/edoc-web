import type { Metadata } from 'next';
import { Archivo, Inter, JetBrains_Mono, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

// These load into "-src" variables, not the token names directly —
// styles/tokens.css composes --font-display etc. as
// `var(--font-display-src), 'Archivo', sans-serif`, so the design
// tokens stay the single source of truth and there's no cascade race
// between this file's :root rule and next/font's generated class.

// --font-display — condensed/expanded heavy display type (boss names, zone titles, stats).
// Loaded as a true variable font (weight: 'variable') with the wdth axis
// included via `axes`, so .text-boss/.text-zone-title/.text-stat can set
// font-stretch and actually get a different width, not just a fixed cut.
const archivo = Archivo({
  variable: '--font-display-src',
  subsets: ['latin'],
  weight: 'variable',
  axes: ['wdth'],
});

// --font-ui — body copy, buttons
const inter = Inter({
  variable: '--font-ui-src',
  subsets: ['latin'],
  weight: ['400', '500'],
});

// --font-code — the user's code, in the editor
const jetbrainsMono = JetBrains_Mono({
  variable: '--font-code-src',
  subsets: ['latin'],
  weight: ['400', '700'],
});

// --font-hud — the machine's voice: labels, telemetry, the ticker
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
      className={`${archivo.variable} ${inter.variable} ${jetbrainsMono.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-void text-text-hi font-ui">
        {children}
      </body>
    </html>
  );
}

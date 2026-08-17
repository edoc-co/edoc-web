import { notFound } from 'next/navigation';
import { getEncounterById, ENCOUNTERS } from '@/lib/encounters/content';
import FightScreen from '@/components/fight/FightScreen';

export async function generateStaticParams() {
  return ENCOUNTERS.map((encounter) => ({ encounterId: encounter.id }));
}

const SESSION_MODES = ['practice', 'ranked', 'proctored'] as const;
type SessionMode = (typeof SESSION_MODES)[number];

function isSessionMode(value: unknown): value is SessionMode {
  return typeof value === 'string' && (SESSION_MODES as readonly string[]).includes(value);
}

export default async function FightPage({ params, searchParams }: PageProps<'/fight/[encounterId]'>) {
  const { encounterId } = await params;
  const encounter = getEncounterById(encounterId);

  if (!encounter) {
    notFound();
  }

  // Session mode is per-session, never global (WORLDS.md's own Part 7
  // instruction) — a query param is the natural home for that: no
  // account state, no persisted setting, just this one fight's mode.
  // Practice/Ranked stay completely open either way; only 'proctored'
  // changes anything (FightScreen gates on it).
  const resolvedSearchParams = await searchParams;
  const modeParam = resolvedSearchParams?.mode;
  const sessionMode: SessionMode = isSessionMode(Array.isArray(modeParam) ? modeParam[0] : modeParam)
    ? (Array.isArray(modeParam) ? modeParam[0] : modeParam) as SessionMode
    : 'practice';

  return <FightScreen encounter={encounter} sessionMode={sessionMode} />;
}

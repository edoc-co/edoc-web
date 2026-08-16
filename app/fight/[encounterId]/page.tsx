import { notFound } from 'next/navigation';
import { getEncounterById, ENCOUNTERS } from '@/lib/encounters/content';
import FightScreen from '@/components/fight/FightScreen';

export async function generateStaticParams() {
  return ENCOUNTERS.map((encounter) => ({ encounterId: encounter.id }));
}

export default async function FightPage({ params }: PageProps<'/fight/[encounterId]'>) {
  const { encounterId } = await params;
  const encounter = getEncounterById(encounterId);

  if (!encounter) {
    notFound();
  }

  return <FightScreen encounter={encounter} />;
}

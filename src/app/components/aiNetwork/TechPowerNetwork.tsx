'use client';

import { TECH_NETWORK } from '../../services/techPowerNetwork';
import PowerNetworkChapter from './PowerNetworkChapter';

export default function TechPowerNetwork({ isDarkMode }: { isDarkMode: boolean }) {
  return <PowerNetworkChapter isDarkMode={isDarkMode} dataset={TECH_NETWORK} />;
}

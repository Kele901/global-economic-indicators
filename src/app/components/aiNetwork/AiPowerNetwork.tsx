'use client';

import React from 'react';
import PowerNetworkChapter from './PowerNetworkChapter';
import { AI_NETWORK } from '../../services/aiPowerNetwork';

export default function AiPowerNetwork({ isDarkMode }: { isDarkMode: boolean }) {
  return <PowerNetworkChapter isDarkMode={isDarkMode} dataset={AI_NETWORK} />;
}

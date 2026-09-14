'use client';

import {
  US, CA, MX, BR, CL, AR, CO, GB, FR, DE, IT, ES, SE, CH, NO, NL, PT, BE, PL, GR,
  RU, UA, TR, SA, EG, IL, IR, AE, QA, MA, NG, ZA, KE, ET, GH, JP, AU, KR, CN, IN,
  ID, SG, VN, TH, PH, PK, BD, TW,
} from 'country-flag-icons/react/3x2';

// One flag lookup for the whole site, keyed by the internal wbKey. Pages used to
// each keep their own partial copy, which is why countries added to the roster
// rendered as grey boxes.
export const COUNTRY_FLAGS: Record<string, React.ComponentType<{ className?: string; title?: string }>> = {
  USA: US, Canada: CA, Mexico: MX,
  Brazil: BR, Chile: CL, Argentina: AR, Colombia: CO,
  UK: GB, France: FR, Germany: DE, Italy: IT, Spain: ES, Sweden: SE,
  Switzerland: CH, Norway: NO, Netherlands: NL, Portugal: PT, Belgium: BE,
  Poland: PL, Greece: GR,
  Russia: RU, Ukraine: UA,
  Turkey: TR, SaudiArabia: SA, Egypt: EG, Israel: IL, Iran: IR, UAE: AE,
  Qatar: QA, Morocco: MA,
  Nigeria: NG, SouthAfrica: ZA, Kenya: KE, Ethiopia: ET, Ghana: GH,
  Japan: JP, Australia: AU, SouthKorea: KR, China: CN, India: IN, Indonesia: ID,
  Singapore: SG, Vietnam: VN, Thailand: TH, Philippines: PH, Pakistan: PK,
  Bangladesh: BD,
  // Curated-only roster member; see CURATED_ONLY_COUNTRIES in countryMappings.
  Taiwan: TW,
};

interface Props {
  /** Internal wbKey, e.g. "SouthKorea". */
  countryKey: string;
  className?: string;
  title?: string;
}

export default function CountryFlag({ countryKey, className = 'w-6 h-4', title }: Props) {
  const Flag = COUNTRY_FLAGS[countryKey];
  if (!Flag) {
    return <span className={`${className} rounded bg-gray-300 dark:bg-gray-600`} aria-hidden="true" />;
  }
  return <Flag className={className} title={title ?? countryKey} />;
}

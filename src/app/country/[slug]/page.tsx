import { COUNTRY_SLUGS } from '../../utils/countryMappings';
import CountryAtAGlance from '../../components/country/CountryAtAGlance';
import CountryProfileClient from './CountryProfileClient';

export default function CountryProfilePage({ params }: { params: { slug: string } }) {
  const key = COUNTRY_SLUGS[params.slug?.toLowerCase() ?? ''];
  return <CountryProfileClient glance={key ? <CountryAtAGlance countryKey={key} /> : null} />;
}

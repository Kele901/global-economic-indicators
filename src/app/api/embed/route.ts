import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const metric = searchParams.get('metric') || 'gdpGrowth';
  const countries = searchParams.get('countries') || 'USA,UK';
  const period = searchParams.get('period') || '10';
  const theme = searchParams.get('theme') || 'light';
  const width = searchParams.get('width') || '600';
  const height = searchParams.get('height') || '400';

  const baseUrl = request.nextUrl.origin;
  const embedUrl = `${baseUrl}/embed/chart?metric=${metric}&countries=${countries}&period=${period}&theme=${theme}`;

  const html = `<iframe src="${embedUrl}" width="${width}" height="${height}" frameborder="0" style="border-radius: 8px; border: 1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'};"></iframe>`;

  return NextResponse.json({
    embedUrl,
    html,
    params: { metric, countries, period, theme, width, height },
  });
}

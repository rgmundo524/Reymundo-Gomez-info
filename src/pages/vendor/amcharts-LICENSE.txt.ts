import license from '../../../licenses/amcharts-LICENSE.txt?raw';

export function GET() {
  return new Response(license, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}

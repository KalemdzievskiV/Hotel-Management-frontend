import { appIcon } from '@/lib/pwa-icon';

const SIZES = [96, 192, 512];

/** /pwa-icon/192 etc., for the web app manifest and notifications */
export async function GET(_request: Request, { params }: { params: Promise<{ size: string }> }) {
  const size = Number((await params).size);
  if (!SIZES.includes(size)) return new Response('Not found', { status: 404 });
  return appIcon(size);
}

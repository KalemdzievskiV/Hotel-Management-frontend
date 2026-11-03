import { appIcon } from '@/lib/pwa-icon';

// The Home Screen icon on iPhone/iPad
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return appIcon(180);
}

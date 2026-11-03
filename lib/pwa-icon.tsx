import { ImageResponse } from 'next/og';

/** The app icon (home screen, notifications), drawn on request so there are no image files to keep */
export function appIcon(size: number) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#111827',
          color: '#ffffff',
          fontSize: size * 0.55,
          fontWeight: 700,
        }}
      >
        H
      </div>
    ),
    { width: size, height: size },
  );
}

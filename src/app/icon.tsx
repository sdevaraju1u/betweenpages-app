import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(ellipse at 30% 30%, #677967 0%, #4E604F 100%)',
          color: '#FFFFFF',
          fontSize: 22,
          fontWeight: 700,
          fontFamily: 'serif',
          borderRadius: '8px',
        }}
      >
        B
      </div>
    ),
    { ...size }
  );
}

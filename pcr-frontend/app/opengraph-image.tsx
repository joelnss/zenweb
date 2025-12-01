import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Zenweb - High Performance eCommerce Solutions';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0f0f1a 100%)',
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              background: '#111',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#fff',
              border: '2px solid rgba(255,255,255,0.1)',
            }}
          >
            Z
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: '#fff',
                letterSpacing: '-1px',
              }}
            >
              Zenweb
            </span>
            <span
              style={{
                fontSize: '18px',
                color: 'rgba(255,255,255,0.5)',
              }}
            >
              High Performance eCommerce
            </span>
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            display: 'flex',
            fontSize: '36px',
            fontWeight: 600,
            color: '#fff',
            textAlign: 'center',
            maxWidth: '800px',
            lineHeight: 1.3,
            marginBottom: '40px',
          }}
        >
          Velocity belongs to the uncluttered machine.
        </div>

        {/* Stats */}
        <div
          style={{
            display: 'flex',
            gap: '48px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#fff' }}>99.9%</span>
            <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>Uptime SLA</span>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#fff' }}>&lt;1s</span>
            <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>Load Times</span>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#fff' }}>50+</span>
            <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>Integrations</span>
          </div>
        </div>

        {/* Bottom URL */}
        <div
          style={{
            display: 'flex',
            marginTop: '48px',
            fontSize: '18px',
            color: 'rgba(255,255,255,0.4)',
          }}
        >
          zenweb.studio
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

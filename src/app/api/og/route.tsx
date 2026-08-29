import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const name = searchParams.get('name') || 'Agent';
    const tag = searchParams.get('tag') || '0001';
    const rank = searchParams.get('rank') || 'Unrated';
    const rankIcon = searchParams.get('rankIcon') || '';
    const avatar = searchParams.get('avatar') || '';
    const kd = searchParams.get('kd') || '1.00';
    const hs = searchParams.get('hs') || '25%';
    const winRate = searchParams.get('wr') || '50%';
    const level = searchParams.get('level') || '50';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '48px 60px',
            backgroundColor: '#0a0e13',
            backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(255, 70, 85, 0.25) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(15, 25, 35, 0.8) 0%, transparent 50%)',
            fontFamily: 'sans-serif',
            color: '#ece8e1',
          }}
        >
          {/* Top Bar: Spycam Logo */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  backgroundColor: '#ff4655',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 900,
                  fontSize: '20px',
                }}
              >
                V
              </div>
              <span style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase' }}>
                SPYCAM <span style={{ color: '#ff4655' }}>TRACKER</span>
              </span>
            </div>
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                padding: '8px 18px',
                borderRadius: '999px',
                fontSize: '14px',
                fontWeight: 700,
                color: '#8b97a3',
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}
            >
              Niveau {level}
            </div>
          </div>

          {/* Center: Player Banner Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            {avatar ? (
              <img
                src={avatar}
                alt="Avatar"
                style={{
                  width: '130px',
                  height: '130px',
                  borderRadius: '24px',
                  border: '3px solid rgba(255, 255, 255, 0.2)',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <div
                style={{
                  width: '130px',
                  height: '130px',
                  borderRadius: '24px',
                  backgroundColor: '#0f1923',
                  border: '3px solid rgba(255, 70, 85, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px',
                  fontWeight: 900,
                }}
              >
                {name[0]?.toUpperCase() || 'P'}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                <span style={{ fontSize: '48px', fontWeight: 900, color: '#ffffff' }}>{name}</span>
                <span style={{ fontSize: '24px', fontWeight: 600, color: '#8b97a3' }}>#{tag}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {rankIcon && (
                  <img src={rankIcon} alt={rank} style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                )}
                <span style={{ fontSize: '26px', fontWeight: 800, color: '#ff4655', textTransform: 'uppercase' }}>
                  {rank}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Grid: Stats Highlights */}
          <div style={{ display: 'flex', gap: '20px' }}>
            <div
              style={{
                flex: 1,
                backgroundColor: 'rgba(15, 25, 35, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '18px',
                padding: '16px 20px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <span style={{ fontSize: '13px', color: '#8b97a3', fontWeight: 700, textTransform: 'uppercase' }}>
                Ratio K/D
              </span>
              <span style={{ fontSize: '32px', fontWeight: 900, color: '#ffffff', marginTop: '4px' }}>
                {kd}
              </span>
            </div>

            <div
              style={{
                flex: 1,
                backgroundColor: 'rgba(15, 25, 35, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '18px',
                padding: '16px 20px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <span style={{ fontSize: '13px', color: '#8b97a3', fontWeight: 700, textTransform: 'uppercase' }}>
                Tirs Tête
              </span>
              <span style={{ fontSize: '32px', fontWeight: 900, color: '#ff4655', marginTop: '4px' }}>
                {hs}
              </span>
            </div>

            <div
              style={{
                flex: 1,
                backgroundColor: 'rgba(15, 25, 35, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '18px',
                padding: '16px 20px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <span style={{ fontSize: '13px', color: '#8b97a3', fontWeight: 700, textTransform: 'uppercase' }}>
                Victoires
              </span>
              <span style={{ fontSize: '32px', fontWeight: 900, color: '#34d399', marginTop: '4px' }}>
                {winRate}
              </span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    return new Response(`Failed to generate the image: ${e.message}`, {
      status: 500,
    });
  }
}

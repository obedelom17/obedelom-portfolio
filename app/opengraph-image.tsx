import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'AGBEBAVI Elom Obed | Développeur Full-Stack & Designer Graphique'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#0a0a0f',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Gradient blobs */}
        <div style={{
          position: 'absolute', top: '-100px', left: '-100px',
          width: '400px', height: '400px',
          background: 'radial-gradient(circle, rgba(0,188,212,0.3) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute', bottom: '-100px', right: '-100px',
          width: '400px', height: '400px',
          background: 'radial-gradient(circle, rgba(109,40,217,0.3) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />

        {/* Badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'rgba(0,188,212,0.15)',
          border: '1px solid rgba(0,188,212,0.4)',
          borderRadius: '999px',
          padding: '8px 20px',
          marginBottom: '32px',
        }}>
          <span style={{ color: '#00bcd4', fontSize: '16px', fontWeight: 600 }}>
            obedelom.dev
          </span>
        </div>

        {/* Name */}
        <div style={{
          fontSize: '72px', fontWeight: 800, color: '#ffffff',
          letterSpacing: '-2px', lineHeight: 1, marginBottom: '16px',
          display: 'flex',
        }}>
          AGBEBAVI Elom&nbsp;
          <span style={{ color: '#00bcd4' }}>Obed</span>
        </div>

        {/* Role */}
        <div style={{
          fontSize: '28px', color: '#94a3b8', marginBottom: '48px',
          display: 'flex',
        }}>
          Développeur Full-Stack &amp; Designer Graphique
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex', gap: '64px',
        }}>
          {[
            { value: '3', label: 'Projets' },
            { value: '5', label: 'Certifications' },
            { value: '3', label: 'Langages' },
          ].map((stat) => (
            <div key={stat.label} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
            }}>
              <span style={{ fontSize: '48px', fontWeight: 700, color: '#00bcd4', lineHeight: 1 }}>
                {stat.value}
              </span>
              <span style={{ fontSize: '16px', color: '#64748b', marginTop: '4px' }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom tag */}
        <div style={{
          position: 'absolute', bottom: '32px',
          display: 'flex', alignItems: 'center', gap: '8px',
          color: '#475569', fontSize: '14px',
        }}>
          <span>📍 Lomé, Togo</span>
          <span style={{ margin: '0 8px' }}>·</span>
          <span>Next.js · Django · Flutter · Photoshop</span>
        </div>
      </div>
    ),
    { ...size }
  )
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin } from 'lucide-react';
import { colors } from '@/constants/colors';

export default function NotFound() {
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [wanderPos, setWanderPos] = useState({ x: 30, y: 40 });

  // Subtle parallax on the floating rings
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Wandering "lost" dot animation
  useEffect(() => {
    const interval = setInterval(() => {
      setWanderPos({
        x: 15 + Math.random() * 70,
        y: 15 + Math.random() * 70,
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const ringOffsetX = (mousePos.x - 50) * 0.15;
  const ringOffsetY = (mousePos.y - 50) * 0.15;

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        overflow: 'hidden',
      }}
    >
      {/* Left — Orange brand panel */}
      <div
        style={{
          flex: '1 1 50%',
          background: `linear-gradient(145deg, ${colors.primary}, #ea580c, #c2410c)`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '64px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Grid dots (same as login) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            pointerEvents: 'none',
          }}
        />

        {/* Floating accent rings with parallax */}
        <div
          style={{
            position: 'absolute',
            top: `calc(-80px + ${ringOffsetY}px)`,
            right: `calc(-80px + ${-ringOffsetX}px)`,
            width: '320px',
            height: '320px',
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.12)',
            pointerEvents: 'none',
            transition: 'top 0.6s ease-out, right 0.6s ease-out',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: `calc(-120px + ${-ringOffsetY}px)`,
            left: `calc(-60px + ${ringOffsetX}px)`,
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.08)',
            pointerEvents: 'none',
            transition: 'bottom 0.6s ease-out, left 0.6s ease-out',
          }}
        />

        {/* Wandering lost pin */}
        <div
          className="notfound-wander"
          style={{
            position: 'absolute',
            left: `${wanderPos.x}%`,
            top: `${wanderPos.y}%`,
            transition: 'left 2.5s cubic-bezier(0.45, 0, 0.15, 1), top 2.5s cubic-bezier(0.45, 0, 0.15, 1)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        >
          <MapPin
            style={{
              width: '32px',
              height: '32px',
              color: 'rgba(255,255,255,0.25)',
              filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.15))',
            }}
          />
        </div>

        {/* Big 404 */}
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <h1
            className="notfound-title"
            style={{
              fontSize: '160px',
              fontWeight: '900',
              color: 'rgba(255,255,255,0.15)',
              letterSpacing: '-0.05em',
              lineHeight: 1,
              userSelect: 'none',
              margin: 0,
            }}
          >
            404
          </h1>
          <p
            style={{
              fontSize: '15px',
              color: 'rgba(255,255,255,0.55)',
              fontWeight: 500,
              marginTop: '-10px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Página não encontrada
          </p>
        </div>
      </div>

      {/* Right — Content panel */}
      <div
        className="bg-white"
        style={{
          flex: '1 1 50%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '64px 48px',
        }}
      >
        <div style={{ width: '100%', maxWidth: '420px' }}>
          {/* Emoji header */}
          <div
            className="notfound-emoji"
            style={{
              fontSize: '56px',
              marginBottom: '24px',
              lineHeight: 1,
            }}
          >
            🗺️
          </div>

          <h2
            className="text-slate-900"
            style={{
              fontSize: '28px',
              fontWeight: '700',
              letterSpacing: '-0.02em',
              marginBottom: '12px',
              lineHeight: 1.2,
            }}
          >
            Opa, parece que você se perdeu!
          </h2>

          <p
            className="text-slate-500"
            style={{
              fontSize: '15px',
              lineHeight: 1.7,
              marginBottom: '16px',
            }}
          >
            Essa página não existe ou foi movida para outro lugar.
            Mas relaxa — acontece com os melhores exploradores. 🧭
          </p>

          <p
            className="text-slate-400"
            style={{
              fontSize: '13px',
              lineHeight: 1.6,
              marginBottom: '36px',
              fontStyle: 'italic',
            }}
          >
            Dica: Se você digitou o endereço manualmente, confira se está tudo certinho.
          </p>

          {/* Action button */}
          <button
            onClick={() => navigate('/')}
            className="notfound-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              height: '48px',
              padding: '0 28px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: colors.primary,
              color: '#fff',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              letterSpacing: '0.01em',
            }}
          >
            <ArrowLeft style={{ width: '18px', height: '18px' }} className="notfound-arrow" />
            Voltar ao início
          </button>

          {/* Fun suggestion pills */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '40px', flexWrap: 'wrap' }}>
            {[
              { label: 'Home', path: '/' },
              { label: 'Layouts', path: '/layouts' },
              { label: 'Geofences', path: '/geofence' },
            ].map((item) => (
              <span
                key={item.path}
                onClick={() => navigate(item.path)}
                className="notfound-pill border-slate-200 text-slate-500 hover:bg-orange-50"
                style={{
                  padding: '6px 16px',
                  borderRadius: '999px',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  letterSpacing: '0.01em',
                  transition: 'all 0.2s ease',
                }}
              >
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Styles & animations */}
      <style>{`
        @keyframes notfound-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes notfound-wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-5deg); }
          75% { transform: rotate(5deg); }
        }

        .notfound-emoji {
          animation: notfound-float 3s ease-in-out infinite;
        }

        .notfound-wander {
          animation: notfound-wiggle 3s ease-in-out infinite;
        }

        .notfound-title {
          transition: color 0.3s ease;
        }
        .notfound-title:hover {
          color: rgba(255,255,255,0.3) !important;
        }

        .notfound-btn:hover {
          filter: brightness(1.08);
        }
        .notfound-btn:hover .notfound-arrow {
          transform: translateX(-3px);
        }
        .notfound-arrow {
          transition: transform 0.2s ease;
        }

        .notfound-pill:hover {
          border-color: ${colors.primary} !important;
          color: ${colors.primary} !important;
        }

        @media (max-width: 768px) {
          div[style*="flex: 1 1 50%"]:first-child {
            display: none !important;
          }
          div[style*="flex: 1 1 50%"]:last-of-type {
            flex: 1 1 100% !important;
          }
        }
      `}</style>
    </div>
  );
}

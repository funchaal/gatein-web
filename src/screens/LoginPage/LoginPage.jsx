import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { clearError } from '../../store/slices/authSlice';
import { useLoginMutation } from '../../services/api';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { colors } from '@/constants/colors';

export default function LoginPage() {
  const isDark = false;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error } = useSelector(state => state.auth);
  const [loginUser, { isLoading }] = useLoginMutation();
  const [formData, setFormData] = useState({ username: 'admin_btp', password: '1234' });
  const [focusedField, setFocusedField] = useState(null);

  const handleChange = (e) => {
    if (error) {
      dispatch(clearError());
    }
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await loginUser(formData).unwrap();
      if (result) {
        navigate('/');
      }
    } catch (err) {
      // Error is handled by extraReducers in authSlice
    }
  };

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const displayError = error?.data?.detail?.message || error?.message || (error && 'Credenciais inválidas');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      {/* Left Brand Panel */}
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
        {/* Geometric accent — subtle grid dots */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            pointerEvents: 'none',
          }}
        />

        {/* Floating accent ring */}
        <div
          style={{
            position: 'absolute',
            top: '-80px',
            right: '-80px',
            width: '320px',
            height: '320px',
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.12)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-120px',
            left: '-60px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.08)',
            pointerEvents: 'none',
          }}
        />

        {/* Brand Content */}
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '400px' }}>
          <h1 style={{
            fontSize: '56px',
            fontWeight: '800',
            color: '#fff',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            marginBottom: '16px',
          }}>
            Gate<span style={{ opacity: 0.7 }}>In</span>
          </h1>
          <p style={{
            fontSize: '18px',
            color: 'rgba(255,255,255,0.75)',
            lineHeight: 1.6,
            fontWeight: 400,
          }}>
            Plataforma de configuração de geofences, schemas e gestão operacional.
          </p>

          {/* Feature pills */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '40px', flexWrap: 'wrap' }}>
            {['Layouts', 'Geofences', 'Serviços', 'API Keys'].map((label) => (
              <span
                key={label}
                style={{
                  padding: '6px 16px',
                  borderRadius: '999px',
                  border: '1px solid rgba(255,255,255,0.25)',
                  color: 'rgba(255,255,255,0.85)',
                  fontSize: '13px',
                  fontWeight: 500,
                  letterSpacing: '0.01em',
                }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div
        style={{
          flex: '1 1 50%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '64px 48px',
          backgroundColor: isDark ? '#020817' : '#fff',
        }}
      >
        <div style={{ width: '100%', maxWidth: '380px' }}>
          {/* Mobile brand (hidden on desktop via media query) */}
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: isDark ? '#f8fafc' : '#0f172a',
              letterSpacing: '-0.02em',
              marginBottom: '8px',
            }}>
              Bem-vindo de volta
            </h2>
            <p style={{
              fontSize: '15px',
              color: isDark ? '#94a3b8' : '#64748b',
              lineHeight: 1.5,
            }}>
              Entre com suas credenciais para acessar o painel.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: isDark ? '#cbd5e1' : '#334155',
                marginBottom: '8px',
                letterSpacing: '0.01em',
              }}>
                Email
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '0 16px',
                height: '48px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: focusedField === 'username' ? (isDark ? '#1e293b' : '#eef2f7') : (isDark ? '#0f172a' : '#f1f5f9'),
                transition: 'all 0.2s ease',
              }}>
                <Mail style={{ width: '18px', height: '18px', color: focusedField === 'username' ? colors.primary : (isDark ? '#64748b' : '#94a3b8'), transition: 'color 0.2s ease', flexShrink: 0 }} />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="user@example.com"
                  required
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    fontSize: '14px',
                    color: isDark ? '#f8fafc' : '#0f172a',
                    backgroundColor: 'transparent',
                    fontFamily: 'inherit',
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: isDark ? '#cbd5e1' : '#334155',
                marginBottom: '8px',
                letterSpacing: '0.01em',
              }}>
                Senha
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '0 16px',
                height: '48px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: focusedField === 'password' ? (isDark ? '#1e293b' : '#eef2f7') : (isDark ? '#0f172a' : '#f1f5f9'),
                transition: 'all 0.2s ease',
              }}>
                <Lock style={{ width: '18px', height: '18px', color: focusedField === 'password' ? colors.primary : (isDark ? '#64748b' : '#94a3b8'), transition: 'color 0.2s ease', flexShrink: 0 }} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••"
                  required
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    fontSize: '14px',
                    color: isDark ? '#f8fafc' : '#0f172a',
                    backgroundColor: 'transparent',
                    fontFamily: 'inherit',
                  }}
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                padding: '12px 16px',
                backgroundColor: isDark ? '#7f1d1d' : '#fef2f2',
                border: `1px solid ${isDark ? '#991b1b' : '#fecaca'}`,
                borderRadius: '12px',
                color: isDark ? '#fca5a5' : '#dc2626',
                fontSize: '13px',
                fontWeight: 500,
                marginBottom: '20px',
                lineHeight: 1.5,
              }}>
                {displayError}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="login-submit-btn"
              style={{
                width: '100%',
                height: '48px',
                marginTop: '30px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: isLoading ? '#fdba74' : colors.primary,
                color: '#fff',
                fontSize: '15px',
                fontWeight: 600,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontFamily: 'inherit',
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} />
                  Entrando...
                </>
              ) : (
                <>
                  Entrar
                  <ArrowRight style={{ width: '18px', height: '18px' }} className="login-arrow" />
                </>
              )}
            </button>
          </form>

        </div>
      </div>

      {/* Spin keyframe for loader */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .login-submit-btn:not(:disabled):hover .login-arrow {
          transform: translateX(3px);
        }
        .login-arrow {
          transition: transform 0.2s ease;
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
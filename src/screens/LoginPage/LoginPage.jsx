import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { clearError } from '../../store/slices/authSlice';
import { useLoginMutation } from '../../services/api';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { colors } from '@/constants/colors';

export default function LoginPage() {
  const isDark = false;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error } = useSelector(state => state.auth);
  const [loginUser, { isLoading }] = useLoginMutation();
  const [formData, setFormData] = useState({ username: 'admin_btp', password: '1234' });
  const [focusedField, setFocusedField] = useState(null);
  const [passwordError, setPasswordError] = useState('');

  const handleChange = (e) => {
    if (passwordError) {
      setPasswordError('');
    }
    if (error) {
      dispatch(clearError());
    }
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    try {
      const result = await loginUser(formData).unwrap();
      if (result) {
        navigate('/');
      }
    } catch {
      setPasswordError('Senha incorreta');
    }
  };

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

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
            <div className="mb-5 space-y-2">
              <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                <Input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="user@example.com"
                  required
                  className="pl-10 h-11"
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-6 space-y-2">
              <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  aria-invalid={Boolean(passwordError)}
                  className="pl-10 h-11"
                />
              </div>
              {passwordError && (
                <span className="block text-xs font-medium text-red-600 mt-1.5 ml-1">
                  {passwordError}
                </span>
              )}
            </div>

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
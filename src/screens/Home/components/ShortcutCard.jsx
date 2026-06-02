import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { colors } from '@/constants/colors';

export default function ShortcutCard({ shortcut, navigate, isDark }) {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = shortcut.icon;

  return (
    <button
      onClick={() => navigate(shortcut.path)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="home-card"
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '20px',
        backgroundColor: isHovered ? (isDark ? '#262626' : '#f5f5f5') : (isDark ? '#171717' : '#fff'),
        border: `1px solid ${isHovered ? colors.primary : (isDark ? '#262626' : '#e5e5e5')}`,
        borderRadius: '16px',
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: 'inherit',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          backgroundColor: isHovered ? colors.primary : (isDark ? '#262626' : '#fafafa'),
          border: `1px solid ${isHovered ? colors.primary : (isDark ? '#404040' : '#e5e5e5')}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '16px',
          flexShrink: 0,
          transition: 'all 0.2s ease',
        }}
      >
        <Icon
          style={{
            width: '20px',
            height: '20px',
            color: isHovered ? '#fff' : (isDark ? '#a3a3a3' : '#737373'),
            transition: 'color 0.2s ease',
          }}
        />
      </div>

      {/* Text content */}
      <div style={{ flex: 1 }}>
        <h3
          style={{
            fontSize: '15px',
            fontWeight: '600',
            color: isDark ? '#fafafa' : '#171717',
            marginBottom: '4px',
            letterSpacing: '-0.01em',
          }}
        >
          {shortcut.title}
        </h3>
        <p
          style={{
            fontSize: '13px',
            color: isDark ? '#a3a3a3' : '#737373',
            lineHeight: 1.4,
            margin: 0,
          }}
        >
          {shortcut.description}
        </p>
      </div>

      {/* Arrow */}
      <ArrowRight
        style={{
          width: '18px',
          height: '18px',
          color: isHovered ? colors.primary : (isDark ? '#404040' : '#d4d4d4'),
          marginLeft: '12px',
          transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
          transition: 'all 0.2s ease',
          flexShrink: 0,
        }}
      />
    </button>
  );
}

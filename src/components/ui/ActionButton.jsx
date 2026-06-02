import React from 'react';
import { Button } from './button';
import { colors } from '@/constants/colors';

export function ActionButton({ children, disabled, isLoading, className = '', style = {}, ...props }) {
  return (
    <Button
      disabled={disabled || isLoading}
      style={{ backgroundColor: isLoading ? '#fdba74' : colors.primary, color: '#ffffff', ...style }}
      className={`hover:opacity-90 transition-opacity ${className}`}
      {...props}
    >
      {children}
    </Button>
  );
}

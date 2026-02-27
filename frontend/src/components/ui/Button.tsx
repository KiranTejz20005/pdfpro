import { type ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'success'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  block?: boolean
  children: React.ReactNode
}

export default function Button({
  variant = 'primary',
  block = false,
  className = '',
  children,
  style,
  ...props
}: ButtonProps) {
  const baseStyle: React.CSSProperties = {
    display: block ? 'flex' : 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '12px 24px',
    fontSize: '0.95rem',
    fontWeight: 500,
    fontFamily: 'inherit',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: props.disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    width: block ? '100%' : 'auto',
    opacity: props.disabled ? 0.5 : 1,
    ...style,
  }

  const variantStyles: Record<Variant, React.CSSProperties> = {
    primary: {
      background: '#2563EB',
      color: '#ffffff',
      boxShadow: props.disabled ? 'none' : '0 4px 6px rgba(0, 0, 0, 0.3)',
    },
    secondary: {
      background: '#121212',
      color: '#A1A1AA',
      border: '1px solid #262626',
    },
    ghost: {
      background: 'transparent',
      color: '#A1A1AA',
    },
    success: {
      background: '#10b981',
      color: '#ffffff',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
    },
  }

  return (
    <button 
      type={props.type ?? 'button'} 
      className={className}
      style={{ ...baseStyle, ...variantStyles[variant] }}
      onMouseEnter={(e) => {
        if (!props.disabled) {
          if (variant === 'primary') {
            e.currentTarget.style.background = '#1d4ed8'
            e.currentTarget.style.boxShadow = '0 0 20px rgba(37, 99, 235, 0.5)'
          } else if (variant === 'success') {
            e.currentTarget.style.background = '#059669'
            e.currentTarget.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.4)'
          } else if (variant === 'secondary') {
            e.currentTarget.style.background = '#1a1a1a'
            e.currentTarget.style.borderColor = '#2563EB'
          } else if (variant === 'ghost') {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
          }
        }
      }}
      onMouseLeave={(e) => {
        if (!props.disabled) {
          if (variant === 'primary') {
            e.currentTarget.style.background = '#2563EB'
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.3)'
          } else if (variant === 'success') {
            e.currentTarget.style.background = '#10b981'
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.3)'
          } else if (variant === 'secondary') {
            e.currentTarget.style.background = '#121212'
            e.currentTarget.style.borderColor = '#262626'
          } else if (variant === 'ghost') {
            e.currentTarget.style.background = 'transparent'
          }
        }
      }}
      {...props}
    >
      {children}
    </button>
  )
}

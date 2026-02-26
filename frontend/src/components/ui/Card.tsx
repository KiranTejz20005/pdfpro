import { type HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  action?: React.ReactNode
  primary?: boolean
  children?: React.ReactNode
}

export default function Card({
  title,
  description,
  action,
  primary = false,
  className = '',
  children,
  ...props
}: CardProps) {
  const classes = ['card', primary ? 'card-primary' : '', className].filter(Boolean).join(' ')
  return (
    <div className={classes} {...props}>
      {title && <h3 className="card-title">{title}</h3>}
      {description && <p className="card-description">{description}</p>}
      {children}
      {action && <div style={{ marginTop: '16px' }}>{action}</div>}
    </div>
  )
}

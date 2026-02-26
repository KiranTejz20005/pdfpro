interface ChipProps {
  children: React.ReactNode
  selected?: boolean
  onClick?: () => void
  className?: string
}

export default function Chip({ children, selected = false, onClick, className = '' }: ChipProps) {
  const classes = ['chip', selected ? 'selected' : '', className].filter(Boolean).join(' ')
  return (
    <button type="button" className={classes} onClick={onClick}>
      {children}
    </button>
  )
}

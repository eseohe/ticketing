import React from 'react'

type Props = React.PropsWithChildren<{ className?: string }>

export default function Card({ children, className = '' }: Props) {
  return (
    <div className={`bg-white/5 p-6 rounded-lg shadow-lg ${className}`}>
      {children}
    </div>
  )
}

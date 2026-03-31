import React from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'outline'
}

export default function Button({ children, className, variant = 'primary', ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-md focus:outline-none'
  const variants: Record<string, string> = {
    primary: 'bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-500',
    ghost: 'bg-transparent text-white px-4 py-2',
    outline: 'border border-white/20 text-white px-4 py-2'
  }

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      whileHover={{ scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className={clsx(base, variants[variant], className)}
      {...props}
    >
      {children}
    </motion.button>
  )
}

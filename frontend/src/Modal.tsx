import React from 'react'
import { motion } from 'framer-motion'

type Props = {
  open: boolean
  onClose?: () => void
  children?: React.ReactNode
}

export default function Modal({ open, onClose, children }: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white p-6 rounded-lg z-10 max-w-lg w-full">
        {children}
      </motion.div>
    </div>
  )
}

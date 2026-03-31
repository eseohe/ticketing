import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type AnimatedListProps<T> = {
  items: T[]
  renderItem: (item: T) => React.ReactNode
  className?: string
  itemKey?: (item: T) => string
}

export default function AnimatedList<T>({ items, renderItem, itemKey = (i: any) => i.id ?? String(Math.random()), className }: AnimatedListProps<T>) {
  return (
    <motion.ul className={className}>
      <AnimatePresence>
        {items.map((it) => (
          <motion.li
            key={itemKey(it as any)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
            className=""
          >
            {renderItem(it)}
          </motion.li>
        ))}
      </AnimatePresence>
    </motion.ul>
  )
}

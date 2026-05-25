import { motion } from 'framer-motion'

const Card = ({ 
  children, 
  className = '', 
  hover = true,
  onClick,
  ...props 
}) => {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.02 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`
        glass rounded-xl overflow-hidden cursor-pointer
        ${hover ? 'transition-all duration-300 hover:bg-white/[0.06] hover:shadow-lg hover:shadow-[#fc3c44]/10' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export default Card
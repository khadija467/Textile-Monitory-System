import { motion } from "framer-motion";

/**
 * Drop-in replacement for <tr> that fades+slides in, staggered by index.
 * Usage: <AnimatedRow index={i} key={item.id}>...</AnimatedRow>
 */
export default function AnimatedRow({ children, index = 0, className = "", ...props }) {
  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.4), ease: "easeOut" }}
      className={className}
      {...props}
    >
      {children}
    </motion.tr>
  );
}

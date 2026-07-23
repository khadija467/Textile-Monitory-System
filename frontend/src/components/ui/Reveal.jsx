import { motion } from "framer-motion";

/**
 * Wraps children in a scroll-triggered fade+rise animation.
 * Use `delay` to stagger multiple siblings (e.g. cards in a grid).
 *
 * <Reveal delay={0.1}><Card>...</Card></Reveal>
 */
export default function Reveal({
  children,
  delay = 0,
  y = 16,
  duration = 0.45,
  className = "",
  once = true,
  amount = 0.2,
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Wraps a list of children and staggers their entrance automatically.
 * Pass an array of children or use .map() as the child.
 *
 * <RevealGroup stagger={0.08}>
 *   {items.map(item => <Card key={item.id} />)}
 * </RevealGroup>
 */
export function RevealGroup({ children, stagger = 0.07, className = "", amount = 0.15 }) {
  const container = {
    hidden: {},
    show: {
      transition: { staggerChildren: stagger },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] } },
  };

  const items = Array.isArray(children) ? children : [children];

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      variants={container}
    >
      {items.map((child, i) => (
        <motion.div key={child?.key ?? i} variants={item}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

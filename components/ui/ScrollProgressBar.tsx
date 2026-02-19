'use client';

import { motion, useScroll, useSpring } from 'framer-motion';

export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      className="fixed left-0 top-0 z-[100] h-0.5 w-full origin-left"
      style={{ scaleX }}
    >
      <div className="h-full w-full" style={{ backgroundColor: '#EBBB69' }} />
    </motion.div>
  );
}

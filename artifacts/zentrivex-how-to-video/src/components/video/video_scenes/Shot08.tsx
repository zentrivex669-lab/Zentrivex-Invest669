import { useState } from 'react';
import { motion } from 'framer-motion';

import { useSceneTimer } from '@/lib/video';

import { EASE } from './SceneKit';

const NUMBERS = ['01', '02', '03', '04', '05', '06'];

export function Shot08() {
  const [resolve, setResolve] = useState(false);
  const [loopOut, setLoopOut] = useState(false);
  useSceneTimer([
    { time: 1020, callback: () => setResolve(true) },
    { time: 2920, callback: () => setLoopOut(true) },
  ]);

  return (
    <motion.section
      className="video-scene video-scene--close"
      initial={{ opacity: 0, backgroundColor: '#071719' }}
      animate={{ opacity: 1, backgroundColor: '#edf4f1' }}
      exit={{ opacity: 1, backgroundColor: '#071719' }}
      transition={{ duration: 0.72, ease: EASE }}
    >
      <div className="close-top-rule" />
      <motion.div
        className="close-orbit"
        initial={{ scale: 0.2, rotate: -45, opacity: 0 }}
        animate={{
          scale: loopOut ? 1.45 : 1,
          rotate: 0,
          opacity: loopOut ? 0.5 : 1,
        }}
        transition={{ duration: loopOut ? 0.72 : 0.6, ease: EASE }}
      />
      <div className="close-numerals">
        {NUMBERS.map((number, index) => (
          <motion.span
            key={number}
            initial={{ x: 180 * Math.cos((index / 6) * Math.PI * 2), y: 180 * Math.sin((index / 6) * Math.PI * 2), opacity: 0, scale: 0.6 }}
            animate={{
              x: resolve ? 0 : 180 * Math.cos((index / 6) * Math.PI * 2),
              y: resolve ? 0 : 180 * Math.sin((index / 6) * Math.PI * 2),
              opacity: resolve ? 0 : 1,
              scale: resolve ? 0.3 : 1,
            }}
            transition={{ delay: index * 0.04, duration: 0.85, ease: EASE }}
          >
            {number}
          </motion.span>
        ))}
      </div>
      <motion.p
        className="close-takeaway"
        initial={{ y: 18, opacity: 0 }}
        animate={{ y: resolve ? 0 : 18, opacity: resolve ? 1 : 0 }}
        transition={{ duration: 0.48, ease: EASE }}
      >
        CREATE. VERIFY. TRACK.
      </motion.p>
      <motion.div
        className="close-wordmark"
        initial={{ scale: 0.82, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ delay: 0.42, duration: 0.65, ease: EASE }}
      >
        Zentrivex
      </motion.div>
      <motion.p
        className="close-subtitle"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.5 }}
      >
        How to use
      </motion.p>
      <motion.div
        className="close-glint"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: loopOut ? 1.5 : 0.8, opacity: loopOut ? 0 : 0.8 }}
        transition={{ duration: 0.7, ease: EASE }}
      />
    </motion.section>
  );
}
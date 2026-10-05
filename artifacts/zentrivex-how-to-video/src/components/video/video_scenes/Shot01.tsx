import { useState } from 'react';
import { motion } from 'framer-motion';

import { useSceneTimer } from '@/lib/video';

import { EASE, PhoneFrame } from './SceneKit';

export function Shot01() {
  const [push, setPush] = useState(false);
  useSceneTimer([{ time: 2320, callback: () => setPush(true) }]);

  return (
    <motion.section
      className="video-scene video-scene--opening"
      initial={{ opacity: 0, scale: 1.025 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.08, filter: 'blur(8px)' }}
      transition={{ duration: 0.55, ease: EASE }}
    >
      <motion.div
        className="opening-ring"
        initial={{ scale: 0.82, opacity: 0.4 }}
        animate={{ scale: [0.82, 1, 1.04], opacity: [0.4, 1, 0.75] }}
        transition={{ duration: 2.7, times: [0, 0.45, 1], ease: EASE }}
      />
      <motion.div
        className="opening-glow"
        animate={{ opacity: [0.48, 0.8, 0.55], scale: [0.96, 1.04, 0.99] }}
        transition={{ duration: 3, ease: 'easeInOut' }}
      />
      <motion.div
        className="opening-copy"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.55, ease: EASE }}
      >
        <span className="video-eyebrow">QUICK GUIDE</span>
        <h1>ZENTRIVEX</h1>
        <p>A quick guide to your account</p>
      </motion.div>
      <motion.div
        className="opening-device"
        initial={{ y: 80, rotate: 5, scale: 0.88, opacity: 0 }}
        animate={{
          y: push ? -20 : 0,
          rotate: push ? 0 : 0,
          scale: push ? 1.08 : 1,
          opacity: 1,
        }}
        transition={{ duration: push ? 0.7 : 0.85, ease: EASE }}
      >
        <PhoneFrame image="site-register.png" />
      </motion.div>
      <motion.div
        className="opening-edge"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.75, duration: 0.62, ease: EASE }}
      />
    </motion.section>
  );
}
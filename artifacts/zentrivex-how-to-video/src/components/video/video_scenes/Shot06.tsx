import { useState } from 'react';
import { motion } from 'framer-motion';

import { useSceneTimer } from '@/lib/video';

import { EASE, PhoneFrame, StepLabel } from './SceneKit';

export function Shot06() {
  const [trace, setTrace] = useState(false);
  useSceneTimer([{ time: 1370, callback: () => setTrace(true) }]);

  return (
    <motion.section
      className="video-scene video-scene--track"
      initial={{ opacity: 0, clipPath: 'inset(0 0 0 100%)' }}
      animate={{ opacity: 1, clipPath: 'inset(0 0 0 0)' }}
      exit={{ opacity: 0, clipPath: 'inset(100% 0 0 0)' }}
      transition={{ duration: 0.58, ease: EASE }}
    >
      <div className="track-side-field" />
      <motion.div
        className="track-phone"
        initial={{ y: 56, rotate: -3, scale: 0.94, opacity: 0 }}
        animate={{ y: 0, rotate: 0, scale: 1, opacity: 1 }}
        transition={{ delay: 0.12, duration: 0.62, ease: EASE }}
      >
        <PhoneFrame image="investments-empty.png">
          <motion.div
            className="track-card-outline"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: trace ? 1 : 0, scale: 1 }}
            transition={{ duration: 0.38, ease: EASE }}
          />
          <motion.div
            className="track-line"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: trace ? 1 : 0 }}
            transition={{ duration: 0.7, ease: EASE }}
          />
        </PhoneFrame>
      </motion.div>
      <motion.div
        className="track-caption"
        initial={{ x: 55, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.45, ease: EASE }}
      >
        <StepLabel number="05" title="TRACK" />
        <h2>Know where<br />to look.</h2>
        <p>Follow progress under My Investments.</p>
      </motion.div>
      <motion.div
        className="track-empty-note"
        initial={{ scale: 0.65, opacity: 0 }}
        animate={{ scale: trace ? 1 : 0.65, opacity: trace ? 1 : 0 }}
        transition={{ delay: 0.18, duration: 0.42, ease: EASE }}
      >
        DEMO ACCOUNT · NO INVESTMENTS
      </motion.div>
    </motion.section>
  );
}
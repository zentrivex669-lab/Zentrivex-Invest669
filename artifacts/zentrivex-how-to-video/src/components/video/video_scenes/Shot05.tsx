import { useState } from 'react';
import { motion } from 'framer-motion';

import { useSceneTimer } from '@/lib/video';

import { EASE, PhoneFrame, StepLabel } from './SceneKit';

export function Shot05() {
  const [focus, setFocus] = useState(false);
  useSceneTimer([{ time: 1360, callback: () => setFocus(true) }]);

  return (
    <motion.section
      className="video-scene video-scene--plan"
      initial={{ opacity: 0, scale: 1.08, filter: 'blur(9px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 1.11, filter: 'blur(12px)' }}
      transition={{ duration: 0.62, ease: EASE }}
    >
      <div className="plan-wedge" />
      <motion.div
        className="plan-copy"
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.45, ease: EASE }}
      >
        <StepLabel number="04" title="CHOOSE A PLAN" />
        <p>Review the terms, then confirm with available funds.</p>
        <span className="plan-copy__hint">TERM · MINIMUM · FULL TERMS</span>
      </motion.div>
      <motion.div
        className="plan-device"
        initial={{ x: 70, rotate: 9, scale: 0.94, opacity: 0 }}
        animate={{
          x: focus ? -14 : 0,
          rotate: focus ? 0 : 0,
          scale: focus ? 1.08 : 1,
          opacity: 1,
        }}
        transition={{ duration: focus ? 0.58 : 0.7, ease: EASE }}
      >
        <PhoneFrame image="plan-review.png">
          <motion.div
            className="plan-screen-note"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.65, duration: 0.4, ease: EASE }}
          >
            REVIEW TERMS
          </motion.div>
          <motion.div
            className="plan-screen-outline"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: focus ? 1.04 : 1 }}
            transition={{ delay: 0.45, duration: 0.45, ease: EASE }}
          />
        </PhoneFrame>
      </motion.div>
      <motion.div className="plan-cut-ring" animate={{ scale: focus ? 1.18 : 0.7, opacity: focus ? 0.95 : 0 }} transition={{ duration: 0.5, ease: EASE }} />
    </motion.section>
  );
}
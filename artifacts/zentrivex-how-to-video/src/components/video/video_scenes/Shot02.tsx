import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { useSceneTimer } from '@/lib/video';

import { EASE, PhoneFrame, StepLabel } from './SceneKit';

const FIELD_HIGHLIGHTS = [
  { top: '35.2%', left: '9%', width: '39%', height: '5.4%' },
  { top: '44.8%', left: '9%', width: '82%', height: '5.8%' },
  { top: '63.8%', left: '9%', width: '82%', height: '5.8%' },
];

export function Shot02() {
  const [activeField, setActiveField] = useState(0);
  useSceneTimer([
    { time: 720, callback: () => setActiveField(1) },
    { time: 1460, callback: () => setActiveField(2) },
  ]);

  return (
    <motion.section
      className="video-scene video-scene--create"
      initial={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
      animate={{ opacity: 1, clipPath: 'inset(0 0 0 0)' }}
      exit={{ opacity: 0, clipPath: 'inset(0 0 0 100%)', scale: 1.04 }}
      transition={{ duration: 0.55, ease: EASE }}
    >
      <div className="create-backplate" />
      <motion.div
        className="create-copy"
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.18, duration: 0.5, ease: EASE }}
      >
        <StepLabel number="01" title="CREATE" />
        <h2>Start with<br />your account.</h2>
        <p>Register using your own details.</p>
      </motion.div>
      <motion.div
        className="create-device"
        initial={{ x: 55, y: 45, rotate: 8, scale: 0.92, opacity: 0 }}
        animate={{ x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }}
        transition={{ delay: 0.12, duration: 0.72, ease: EASE }}
      >
        <PhoneFrame image="site-register.png">
          <AnimatePresence mode="sync">
            <motion.div
              key={activeField}
              className="field-highlight"
              style={FIELD_HIGHLIGHTS[activeField]}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.04 }}
              transition={{ duration: 0.28, ease: EASE }}
            />
          </AnimatePresence>
          <motion.div
            className="field-sweep"
            initial={{ y: '140%', opacity: 0 }}
            animate={{ y: ['140%', '32%', '140%'], opacity: [0, 0.9, 0] }}
            transition={{ delay: 0.45, duration: 2.3, ease: EASE }}
          />
        </PhoneFrame>
      </motion.div>
      <motion.div
        className="create-index"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.55, duration: 0.4, ease: EASE }}
      >
        1<span>/</span>6
      </motion.div>
      <motion.div className="create-cut-line" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 2.45, duration: 0.65, ease: EASE }} />
    </motion.section>
  );
}
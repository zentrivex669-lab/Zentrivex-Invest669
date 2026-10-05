import { useState } from 'react';
import { motion } from 'framer-motion';

import { useSceneTimer } from '@/lib/video';

import { EASE, PhoneFrame, StepLabel } from './SceneKit';

export function Shot07() {
  const [approval, setApproval] = useState(false);
  const [fold, setFold] = useState(false);
  useSceneTimer([
    { time: 760, callback: () => setApproval(true) },
    { time: 2650, callback: () => setFold(true) },
  ]);

  return (
    <motion.section
      className="video-scene video-scene--withdraw"
      initial={{ opacity: 0, rotateY: -8, scale: 0.95 }}
      animate={{ opacity: 1, rotateY: 0, scale: 1 }}
      exit={{ opacity: 0, rotateY: 13, scale: 0.92 }}
      transition={{ duration: 0.62, ease: EASE }}
    >
      <div className="withdraw-field" />
      <motion.div
        className="withdraw-title"
        initial={{ x: -44, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.16, duration: 0.42, ease: EASE }}
      >
        <StepLabel number="06" title="WITHDRAW" />
        <p>Request from available balance; approval is required.</p>
      </motion.div>
      <motion.div
        className="withdraw-phone"
        initial={{ x: 55, rotate: 5, scale: 0.94, opacity: 0 }}
        animate={{
          x: fold ? 40 : 0,
          rotate: fold ? 7 : 0,
          scale: fold ? 0.92 : 1,
          opacity: 1,
        }}
        transition={{ duration: fold ? 0.48 : 0.68, ease: EASE }}
      >
        <PhoneFrame image="withdraw-empty.png">
          <motion.div
            className="withdraw-approval-outline"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: approval ? 1 : 0, scale: 1 }}
            transition={{ duration: 0.35, ease: EASE }}
          />
          <motion.div
            className="withdraw-light-sweep"
            initial={{ x: '-120%', opacity: 0 }}
            animate={approval ? { x: ['-120%', '120%'], opacity: [0, 0.72, 0] } : { x: '-120%', opacity: 0 }}
            transition={{ delay: 0.28, duration: 0.8, ease: EASE }}
          />
        </PhoneFrame>
      </motion.div>
      <motion.div
        className="withdraw-end-ring"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: fold ? 1.16 : 0.5, opacity: fold ? 0.9 : 0 }}
        transition={{ duration: 0.5, ease: EASE }}
      />
    </motion.section>
  );
}
import { useState } from 'react';
import { motion } from 'framer-motion';

import { useSceneTimer } from '@/lib/video';

import { EASE, PhoneFrame, StepLabel } from './SceneKit';

export function Shot03() {
  const [scan, setScan] = useState(false);
  const [confirm, setConfirm] = useState(false);
  useSceneTimer([
    { time: 780, callback: () => setScan(true) },
    { time: 1850, callback: () => setConfirm(true) },
  ]);

  return (
    <motion.section
      className="video-scene video-scene--verify"
      initial={{ opacity: 0, clipPath: 'circle(0% at 50% 50%)' }}
      animate={{ opacity: 1, clipPath: 'circle(120% at 50% 50%)' }}
      exit={{ opacity: 0, scale: 1.06, filter: 'blur(7px)' }}
      transition={{ duration: 0.62, ease: EASE }}
    >
      <div className="verify-orbit verify-orbit--one" />
      <div className="verify-orbit verify-orbit--two" />
      <motion.div
        className="verify-headline"
        initial={{ y: -32, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.18, duration: 0.45, ease: EASE }}
      >
        <StepLabel number="02" title="VERIFY" />
        <p>Complete identity checks before transactions.</p>
      </motion.div>
      <motion.div
        className="verify-device"
        initial={{ y: 60, scale: 0.9, rotate: -4, opacity: 0 }}
        animate={{ y: 0, scale: 1, rotate: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.65, ease: EASE }}
      >
        <PhoneFrame image="dashboard-verification.png">
          <motion.div
            className={`kyc-outline${scan ? ' kyc-outline--active' : ''}`}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: scan ? 1 : 0.55, scale: 1 }}
            transition={{ duration: 0.35, ease: EASE }}
          />
          <motion.div
            className="kyc-scan-line"
            initial={{ y: '-40%', opacity: 0 }}
            animate={scan ? { y: ['-40%', '350%'], opacity: [0, 1, 0] } : { y: '-40%', opacity: 0 }}
            transition={{ duration: 0.9, ease: 'easeInOut' }}
          />
          <motion.div
            className={`verify-stamp${confirm ? ' verify-stamp--shown' : ''}`}
            initial={{ scale: 0.5, opacity: 0, rotate: -8 }}
            animate={{ scale: confirm ? 1 : 0.5, opacity: confirm ? 1 : 0, rotate: 0 }}
            transition={{ duration: 0.42, ease: EASE }}
          >
            VERIFY FIRST
          </motion.div>
        </PhoneFrame>
      </motion.div>
      <motion.div
        className="verify-side-note"
        initial={{ x: 55, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.55, duration: 0.45, ease: EASE }}
      >
        Deposits<br />Investments<br />Withdrawals
      </motion.div>
    </motion.section>
  );
}
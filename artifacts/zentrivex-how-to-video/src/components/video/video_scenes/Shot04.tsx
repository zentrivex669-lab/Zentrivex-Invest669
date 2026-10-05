import { useState } from 'react';
import { motion } from 'framer-motion';

import { useSceneTimer } from '@/lib/video';

import { EASE, StepLabel } from './SceneKit';

const STEPS = [
  { title: 'Choose a method', number: '01' },
  { title: 'Enter an amount', number: '02' },
  { title: 'Wait for review', number: '03' },
];

export function Shot04() {
  const [active, setActive] = useState(0);
  useSceneTimer([
    { time: 780, callback: () => setActive(1) },
    { time: 1540, callback: () => setActive(2) },
  ]);

  return (
    <motion.section
      className="video-scene video-scene--deposit"
      initial={{ opacity: 0, clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)' }}
      animate={{ opacity: 1, clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
      exit={{ opacity: 0, clipPath: 'polygon(0 0, 0 0, 100% 100%, 0 100%)' }}
      transition={{ duration: 0.55, ease: EASE }}
    >
      <div className="deposit-backplate" />
      <motion.div
        className="deposit-heading"
        initial={{ x: -45, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.14, duration: 0.42, ease: EASE }}
      >
        <StepLabel number="03" title="ADD FUNDS" />
        <p>Submit a deposit request and wait for review.</p>
      </motion.div>
      <div className="deposit-flow">
        <svg className="deposit-flow__path" viewBox="0 0 400 500" preserveAspectRatio="none" aria-hidden="true">
          <motion.path
            d="M90 75 C300 120 95 210 300 255 C360 330 135 355 205 440"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray="7 12"
            initial={{ pathLength: 0, opacity: 0.2 }}
            animate={{ pathLength: 1, opacity: 0.8 }}
            transition={{ delay: 0.35, duration: 1.7, ease: EASE }}
          />
        </svg>
        {STEPS.map((step, index) => (
          <motion.div
            key={step.number}
            className={`deposit-step deposit-step--${index + 1}${active === index ? ' deposit-step--active' : ''}`}
            initial={{ x: index % 2 ? 85 : -85, y: 24, opacity: 0, rotate: index % 2 ? 5 : -5 }}
            animate={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: active === index ? 1.04 : 1 }}
            transition={{ delay: 0.25 + index * 0.52, duration: 0.55, ease: EASE }}
          >
            <span className="deposit-step__number">{step.number}</span>
            <span className="deposit-step__title">{step.title}</span>
            <span className="deposit-step__edge" />
          </motion.div>
        ))}
      </div>
      <motion.div
        className="deposit-footnote"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.65, duration: 0.35 }}
      >
        A request is not a completed deposit.
      </motion.div>
    </motion.section>
  );
}
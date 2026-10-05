import { useEffect, useRef } from 'react';
import {
  VideoCanvas,
  type VideoAspectRatio,
  useVideoPlayer,
  useVideoAudio,
} from '@/lib/video';
import { AnimatePresence } from 'framer-motion';
import {
  jumpToScene,
  setAudioMuted,
  setPaused,
} from '@/lib/video/playerActions';

import { Shot01 } from './video_scenes/Shot01';
import { Shot02 } from './video_scenes/Shot02';
import { Shot03 } from './video_scenes/Shot03';
import { Shot04 } from './video_scenes/Shot04';
import { Shot05 } from './video_scenes/Shot05';
import { Shot06 } from './video_scenes/Shot06';
import { Shot07 } from './video_scenes/Shot07';
import { Shot08 } from './video_scenes/Shot08';

export const SCENE_DURATIONS = {
  opening: 3300,
  create: 3900,
  verify: 3700,
  deposit: 3800,
  plan: 3900,
  track: 3900,
  withdraw: 3700,
  close: 3800,
} as const;

const SCENE_TITLES: Record<string, string> = {
  opening: 'Opening',
  create: 'Create account',
  verify: 'Identity verification',
  deposit: 'Add funds',
  plan: 'Choose a plan',
  track: 'Track progress',
  withdraw: 'Withdrawal request',
  close: 'Brand close',
};

const VIDEO_ASPECT_RATIO: VideoAspectRatio = '4:5';
const AUDIO_SRC = `${import.meta.env.BASE_URL}audio/zentrivex-guide-bed.mp3`;

const SCENES = [
  Shot01,
  Shot02,
  Shot03,
  Shot04,
  Shot05,
  Shot06,
  Shot07,
  Shot08,
];

export default function VideoTemplate() {
  const { currentScene, currentSceneKey } = useVideoPlayer({
    durations: SCENE_DURATIONS,
  });
  const { muted, paused } = useVideoAudio();
  const audioRef = useRef<HTMLAudioElement>(null);
  const Scene = SCENES[currentScene] ?? Shot01;
  const iframed =
    typeof window !== 'undefined' && window.self !== window.top;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = muted;
    if (paused) {
      audio.pause();
      return;
    }
    void audio.play().catch(() => {
      // Browsers may require a user gesture before audio can start.
    });
  }, [muted, paused]);

  const toggleMute = () => {
    const nextMuted = !muted;
    const audio = audioRef.current;
    if (audio) {
      audio.muted = nextMuted;
      if (!nextMuted) {
        void audio.play().catch(() => {
          // The in-frame sound button is a user gesture; retain browser safety.
        });
      }
    }
    setAudioMuted(nextMuted);
  };

  return (
    <VideoCanvas
      aspectRatio={VIDEO_ASPECT_RATIO}
      style={{ backgroundColor: 'var(--color-bg-dark)' }}
    >
      <audio
        ref={audioRef}
        src={AUDIO_SRC}
        autoPlay
        loop
        preload="auto"
        aria-hidden="true"
      />
      <AnimatePresence mode="sync">
        <Scene key={currentSceneKey} />
      </AnimatePresence>
      {iframed && (
        <div className="embedded-controls" role="group" aria-label="Walkthrough controls">
          <div className="embedded-controls__scenes" aria-label="Jump to a section">
            {Object.entries(SCENE_DURATIONS).map(([key], index) => (
              <button
                key={key}
                type="button"
                className={`embedded-controls__segment${currentScene === index ? ' is-active' : ''}`}
                aria-label={`Play section ${index + 1}: ${SCENE_TITLES[key]}`}
                aria-current={currentScene === index ? 'step' : undefined}
                title={SCENE_TITLES[key]}
                onClick={() => jumpToScene(index)}
              />
            ))}
          </div>
          <div className="embedded-controls__actions">
            <button
              type="button"
              className="embedded-controls__button"
              aria-label={paused ? 'Play walkthrough' : 'Pause walkthrough'}
              onClick={() => setPaused(!paused)}
            >
              {paused ? '▶' : 'Ⅱ'}
            </button>
            <span className="embedded-controls__title">{SCENE_TITLES[currentSceneKey]}</span>
            <button
              type="button"
              className="embedded-controls__button embedded-controls__sound"
              aria-label={muted ? 'Turn sound on' : 'Mute soundtrack'}
              aria-pressed={muted}
              onClick={toggleMute}
            >
              {muted ? 'Sound off' : 'Sound on'}
            </button>
          </div>
        </div>
      )}
    </VideoCanvas>
  );
}
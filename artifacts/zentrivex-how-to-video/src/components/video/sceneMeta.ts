// Optional scene metadata for Replit workspace integrations. When the
// workspace's scene controls are enabled for this project, a viewer's click on
// a scene segment scopes their next chat request to that scene's source file.
// Fill one entry per SCENE_DURATIONS key in VideoTemplate.tsx only when a
// skill reference asks for it; otherwise leave the map empty. Scenes missing
// from the map still play and can be jumped to.
//
// Example:
//   export const SCENE_DETAILS: Record<string, SceneDetails> = {
//     open: { title: 'Intro', filePath: 'src/components/video/video_scenes/Scene1.tsx' },
//   };

export interface SceneDetails {
  title: string;
  filePath: string;
}

export const SCENE_DETAILS: Record<string, SceneDetails> = {
  opening: {
    title: 'Opening',
    filePath: 'src/components/video/video_scenes/Shot01.tsx',
  },
  create: {
    title: 'Create account',
    filePath: 'src/components/video/video_scenes/Shot02.tsx',
  },
  verify: {
    title: 'Identity verification',
    filePath: 'src/components/video/video_scenes/Shot03.tsx',
  },
  deposit: {
    title: 'Add funds',
    filePath: 'src/components/video/video_scenes/Shot04.tsx',
  },
  plan: {
    title: 'Choose a plan',
    filePath: 'src/components/video/video_scenes/Shot05.tsx',
  },
  track: {
    title: 'Track progress',
    filePath: 'src/components/video/video_scenes/Shot06.tsx',
  },
  withdraw: {
    title: 'Withdrawal request',
    filePath: 'src/components/video/video_scenes/Shot07.tsx',
  },
  close: {
    title: 'Brand close',
    filePath: 'src/components/video/video_scenes/Shot08.tsx',
  },
};

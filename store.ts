import { create } from 'zustand';

export type Phase = 'tree' | 'blooming' | 'nebula' | 'collapsing';

interface AppState {
  phase: Phase;
  setPhase: (phase: Phase) => void;
  
  // Hand tracking state
  isCameraOpen: boolean;
  setCameraOpen: (isOpen: boolean) => void;
  lastGesture: string | null;
  setLastGesture: (gesture: string | null) => void;

  // Photos
  photos: string[];
  uploadPhotos: (urls: string[]) => void;
  
  // Interaction
  activePhotoIndex: number | null;
  setActivePhotoIndex: (index: number | null) => void;
  nebulaRotation: number;
  setNebulaRotation: (rot: number) => void;
}

// 12 Default Polaroid-style images to fill the ring
const defaultPhotos = Array.from({ length: 12 }).map((_, i) => 
  `https://picsum.photos/seed/${i + 2024}/400/500`
);

export const useStore = create<AppState>((set) => ({
  phase: 'tree',
  setPhase: (phase) => set({ phase }),

  isCameraOpen: false,
  setCameraOpen: (isOpen) => set({ isCameraOpen: isOpen }),
  
  lastGesture: null,
  setLastGesture: (gesture) => set({ lastGesture: gesture }),

  photos: defaultPhotos,
  
  // Replace current photos with uploaded ones, limit to 12
  uploadPhotos: (newUrls) => set({ photos: newUrls.slice(0, 12) }),

  activePhotoIndex: null,
  setActivePhotoIndex: (index) => set({ activePhotoIndex: index }),

  nebulaRotation: 0,
  setNebulaRotation: (rot) => set({ nebulaRotation: rot }),
}));
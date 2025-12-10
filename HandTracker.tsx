import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker, DrawingUtils } from '@mediapipe/tasks-vision';
import { useStore } from '../store';

const HandTracker: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // OPTIMIZATION: Split selectors to compare primitives by value. 
  // This prevents re-renders when other parts of the store (like nebulaRotation) update.
  const isCameraOpen = useStore((state) => state.isCameraOpen);
  const lastGesture = useStore((state) => state.lastGesture);
  
  const [loading, setLoading] = useState(false);
  const [landmarker, setLandmarker] = useState<HandLandmarker | null>(null);
  const requestRef = useRef<number | null>(null);

  // Initialize MediaPipe
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.2/wasm"
        );
        const newLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });
        setLandmarker(newLandmarker);
        console.log("MediaPipe initialized");
      } catch (err) {
        console.error("Failed to init MediaPipe:", err);
      } finally {
        setLoading(false);
      }
    };
    if (isCameraOpen && !landmarker) {
      init();
    }
  }, [isCameraOpen, landmarker]);

  // Process Video Frames
  const predict = () => {
    // STOP if camera is closed in store
    if (!useStore.getState().isCameraOpen) return;

    // STOP if DOM elements are missing (component returning null)
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;

    // WAIT if logic not ready or video has no dimensions yet
    if (!landmarker || video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
       requestRef.current = requestAnimationFrame(predict);
       return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    try {
      const startTimeMs = performance.now();
      const results = landmarker.detectForVideo(video, startTimeMs);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update canvas size to match video to prevent distortion in drawing
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
      }
      
      const drawingUtils = new DrawingUtils(ctx);
      
      if (results && results.landmarks) {
        for (const landmarks of results.landmarks) {
          drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, {
            color: "#00FF00",
            lineWidth: 2
          });
          drawingUtils.drawLandmarks(landmarks, { color: "#FF0000", lineWidth: 1 });

          // Simple Gesture Logic
          const wrist = landmarks[0];
          const tips = [landmarks[4], landmarks[8], landmarks[12], landmarks[16], landmarks[20]]; 
          const bases = [landmarks[2], landmarks[5], landmarks[9], landmarks[13], landmarks[17]];

          let extendedCount = 0;
          for (let i = 1; i < 5; i++) {
              const tipDist = Math.hypot(tips[i].x - wrist.x, tips[i].y - wrist.y);
              const baseDist = Math.hypot(bases[i].x - wrist.x, bases[i].y - wrist.y);
              if (tipDist > baseDist * 1.3) extendedCount++;
          }

          let currentGesture = "UNKNOWN";
          if (extendedCount >= 4) currentGesture = "Open_Palm";
          else if (extendedCount === 0) currentGesture = "Closed_Fist";

          // Access store state directly
          const state = useStore.getState();
          const { phase, nebulaRotation } = state;

          // Dispatch Actions ONLY if needed
          if (currentGesture === "Open_Palm") {
              if (phase === 'tree') {
                  state.setPhase('blooming');
              } else if (phase === 'nebula') {
                  // Swipe logic
                  const handX = landmarks[9].x; 
                  // Updates state, which triggers subscribers. 
                  // Since we fixed the selector above, this component won't re-render!
                  if (handX < 0.4) state.setNebulaRotation(nebulaRotation + 0.05);
                  if (handX > 0.6) state.setNebulaRotation(nebulaRotation - 0.05);
              }
          } else if (currentGesture === "Closed_Fist") {
              if (phase === 'nebula') {
                  state.setPhase('collapsing');
              }
          }
          
          if (state.lastGesture !== currentGesture) {
              state.setLastGesture(currentGesture);
          }
        }
      }
    } catch (error) {
        console.warn("Prediction error:", error);
    }
    
    requestRef.current = requestAnimationFrame(predict);
  };

  useEffect(() => {
    let stream: MediaStream | null = null;

    if (isCameraOpen && landmarker) {
      navigator.mediaDevices.getUserMedia({ video: true }).then((s) => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadeddata = () => {
              if (videoRef.current) {
                  videoRef.current.play().catch(e => console.warn("Play failed", e));
                  predict();
              }
          };
        }
      }).catch(err => {
          console.error("Camera access denied or error:", err);
          useStore.getState().setCameraOpen(false);
      });
    }

    return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    };
  }, [isCameraOpen, landmarker]);

  if (!isCameraOpen) return null;

  return (
    <div className="fixed top-4 right-4 z-50 p-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-2xl w-48 transition-all">
       {loading && <p className="text-white text-xs text-center mb-2">Loading Model...</p>}
       <div className="relative rounded-lg overflow-hidden aspect-[4/3] bg-black/50">
         <video 
            ref={videoRef} 
            className="absolute top-0 left-0 w-full h-full object-cover -scale-x-100" 
            playsInline 
            muted 
         />
         <canvas 
            ref={canvasRef} 
            className="absolute top-0 left-0 w-full h-full object-cover -scale-x-100" 
         />
       </div>
       <div className="mt-2 text-center">
            <span className="text-xs text-blue-200 font-mono tracking-wider">
                {lastGesture || "NO HAND"}
            </span>
       </div>
    </div>
  );
};

export default HandTracker;
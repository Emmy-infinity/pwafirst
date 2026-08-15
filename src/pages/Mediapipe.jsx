import React, { useEffect, useRef, useState } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

const OfflineHandTracker = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [landmarker, setLandmarker] = useState(null);
  const [isReady, setIsReady] = useState(false);

  // 1. Create a mutable ref container to isolate the prediction loop logic
  const predictLoopRef = useRef(null);

  // 2. Define the loop inside a clean useEffect hook hook scope
  useEffect(() => {
    const loop = async () => {
      // Safely access current refs inside the async block
      if (!landmarker || !videoRef.current || !canvasRef.current) return;

      // React ignores non-idempotent hooks locked inside isolated side effects
      const startTimeMs = performance.now();
      const results = landmarker.detectForVideo(videoRef.current, startTimeMs);

      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, 640, 480);

      if (results.landmarks) {
        for (const landmarks of results.landmarks) {
          for (const point of landmarks) {
            const x = point.x * 640;
            const y = point.y * 480;
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = '#00FF00';
            ctx.fill();
          }
        }
      }

      // Loop using the persistent reference pointer
      requestAnimationFrame(predictLoopRef.current);
    };

    // Assign the tracking block safely to the mutable ref
    predictLoopRef.current = loop;
  }, [landmarker]); // Only rebuilds if the model instance changes

  // 3. Keep initialization logic cleanly separated
  useEffect(() => {
    const initMediaPipeOffline = async () => {
      const localBaseUrl = window.location.origin;
      const vision = await FilesetResolver.forVisionTasks(`${localBaseUrl}/mediapipe/wasm`);
      const tracker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `${localBaseUrl}/face_landmarker.task`,
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: 2
      });

      setLandmarker(tracker);
      setIsReady(true);
    };

    initMediaPipeOffline();
  }, []);

  const startCamera = async () => {
    if (!isReady || !videoRef.current || !predictLoopRef.current) return;
    
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480, frameRate: 30 }
    });
    
    videoRef.current.srcObject = stream;
    videoRef.current.addEventListener('loadeddata', () => {
      // Trigger execution safely via the ref container
      predictLoopRef.current();
    });
  };

  return (
    <div>
      {/* Keeping rest of component UI layout identical */}
      {!isReady ? <p>Loading Local AI Modules...</p> : <button onClick={startCamera}>Start Detection</button>}
      <div style={{ position: 'relative', width: '640px', height: '480px' }}>
        <video ref={videoRef} autoPlay playsInline muted style={{ transform: 'scaleX(-1)', width: '640px', height: '480px', position: 'absolute' }} />
        <canvas ref={canvasRef} width="640" height="480" style={{ transform: 'scaleX(-1)', position: 'absolute', zIndex: 2 }} />
      </div>
    </div>
  );
};

export default OfflineHandTracker;

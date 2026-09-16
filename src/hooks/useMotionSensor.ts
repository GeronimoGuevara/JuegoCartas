import { useEffect, useRef, useState, useCallback } from 'react';

interface MotionState {
  isMonitoring: boolean;
  tiltX: number;
  tiltY: number;
  isStable: boolean;
  error: string | null;
}

export function useMotionSensor() {
  const [state, setState] = useState<MotionState>({
    isMonitoring: false,
    tiltX: 0,
    tiltY: 0,
    isStable: true,
    error: null,
  });

  const motionHandlerRef = useRef<((e: DeviceMotionEvent) => void) | null>(null);
  const stabilityCount = useRef(0);

  const startMonitoring = useCallback(() => {
    if (!('DeviceMotionEvent' in window)) {
      setState((prev) => ({ ...prev, error: 'Sensor de movimiento no disponible' }));
      return;
    }

    const handleMotion = (e: DeviceMotionEvent) => {
      const accel = e.accelerationIncludingGravity;
      if (!accel) return;

      const x = accel.x ?? 0;
      const y = accel.y ?? 0;

      setState((prev) => ({ ...prev, tiltX: x, tiltY: y }));

      if (Math.abs(x) < 0.5 && Math.abs(y) < 0.5) {
        stabilityCount.current += 1;
      } else {
        stabilityCount.current = 0;
      }
    };

    motionHandlerRef.current = handleMotion;
    window.addEventListener('devicemotion', handleMotion);
    setState({ isMonitoring: true, tiltX: 0, tiltY: 0, isStable: true, error: null });
  }, []);

  const stopMonitoring = useCallback(() => {
    if (motionHandlerRef.current) {
      window.removeEventListener('devicemotion', motionHandlerRef.current);
      motionHandlerRef.current = null;
    }
    setState((prev) => ({ ...prev, isMonitoring: false }));
  }, []);

  const checkStability = useCallback(async (thresholdMs: number = 3000): Promise<boolean> => {
    return new Promise((resolve) => {
      stabilityCount.current = 0;
      const startTime = Date.now();
      const checkInterval = setInterval(() => {
        if (stabilityCount.current >= 10) {
          clearInterval(checkInterval);
          resolve(true);
        }
        if (Date.now() - startTime >= thresholdMs) {
          clearInterval(checkInterval);
          resolve(false);
        }
      }, 300);
    });
  }, []);

  useEffect(() => {
    return () => {
      if (motionHandlerRef.current) {
        window.removeEventListener('devicemotion', motionHandlerRef.current);
      }
    };
  }, []);

  return { ...state, startMonitoring, stopMonitoring, checkStability };
}

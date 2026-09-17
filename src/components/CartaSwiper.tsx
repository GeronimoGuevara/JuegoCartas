import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { Carta, Categoria } from '../types';

interface CartaSwiperProps {
  carta: Carta;
  categoria?: Categoria;
  textoResuelto: string;
  onCumplido: () => void;
  onRebotar: () => void;
}

export default function CartaSwiper({
  carta,
  categoria,
  textoResuelto,
  onCumplido,
  onRebotar,
}: CartaSwiperProps) {
  const [exitX, setExitX] = useState<number>(0);
  const controls = useAnimation();
  const x = useMotionValue(0);

  // Para girar ligeramente la carta mientras se arrastra
  const rotate = useTransform(x, [-200, 200], [-10, 10]);
  const opacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5]);

  // Cuando cambia la carta, reiniciamos la animación para que entre desde abajo/centro
  useEffect(() => {
    setExitX(0);
    x.set(0);
    controls.start({
      x: 0,
      y: 0,
      opacity: 1,
      scale: 1,
      transition: { type: 'spring', stiffness: 300, damping: 20 },
    });
  }, [carta.id, controls, x]);

  const handleDragEnd = (event: any, info: any) => {
    // Si se arrastró más de 100px a la derecha o izquierda
    const umbral = 100;
    if (info.offset.x > umbral) {
      // Swipe Right -> Cumplido
      setExitX(300);
      onCumplido();
    } else if (info.offset.x < -umbral) {
      // Swipe Left -> Rebotar
      setExitX(-300);
      onRebotar();
    } else {
      // Volver al centro
      controls.start({ x: 0, y: 0 });
    }
  };

  const handleBotonAccion = (direccion: 'left' | 'right') => {
    setExitX(direccion === 'right' ? 300 : -300);
    if (direccion === 'right') {
      onCumplido();
    } else {
      onRebotar();
    }
  };

  const colorIntensidad = categoria?.intensidad === 'picante' ? 'var(--carmesi)' : 'var(--ambar)';
  
  let pillText = categoria?.nombre.toUpperCase() || 'CARTA';
  if (pillText === 'ACCIÓN DIRECTA' || pillText === 'ACCION DIRECTA') pillText = 'RETO HOT 🔥';
  if (pillText === 'JUEGOS PREVIOS') pillText = 'RETO';
  if (pillText === 'CONFESIONES') pillText = 'PREGUNTA';

  return (
    <div className="carta-swiper-container">
      <motion.div
        className="carta-activa"
        style={{
          x,
          rotate,
          opacity,
          borderColor: colorIntensidad,
          boxShadow: `0 0 20px ${colorIntensidad}40`
        }}
        drag="x"
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.8}
        onDragEnd={handleDragEnd}
        animate={controls}
        initial={{ scale: 0.8, opacity: 0 }}
        exit={{ x: exitX, opacity: 0, transition: { duration: 0.2 } }}
        whileTap={{ cursor: 'grabbing' }}
      >
        <div className="carta-categoria-pill" style={{ borderColor: colorIntensidad, color: colorIntensidad }}>
          {pillText}
        </div>
        
        <div className="carta-contenido">
          {textoResuelto}
        </div>
        
        <div className="carta-hint">
          (Desliza para elegir)
        </div>
      </motion.div>

      <div className="carta-acciones">
        <button 
          type="button" 
          className="btn-jugar-inicio btn-rebotar" 
          onClick={() => handleBotonAccion('left')}
          style={{ background: 'transparent', border: '2px solid var(--texto-muted)', color: 'var(--texto)' }}
        >
          🔁 Rebotar
        </button>
        <button 
          type="button" 
          className="btn-jugar-inicio btn-cumplido" 
          onClick={() => handleBotonAccion('right')}
          style={{ background: 'linear-gradient(90deg, var(--carmesi), var(--rojo-oscuro))' }}
        >
          ✅ Logrado
        </button>
      </div>
    </div>
  );
}

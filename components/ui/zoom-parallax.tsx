'use client';

import { useScroll, useTransform, motion, useMotionValueEvent } from 'framer-motion';
import { useRef } from 'react';
import { useParallax } from '@/context/parallax-context';

interface Image {
  src: string;
  alt?: string;
  objectPosition?: string;
}

interface ZoomParallaxProps {
  images: Image[];
}

export function ZoomParallax({ images }: ZoomParallaxProps) {
  const container = useRef(null);
  const { setZoomProgress } = useParallax();

  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start start', 'end end'],
  });

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    setZoomProgress(latest);
  });

  const scale4 = useTransform(scrollYProgress, [0, 1], [1, 4]);
  const scale5 = useTransform(scrollYProgress, [0, 1], [1, 5]);
  const scale6 = useTransform(scrollYProgress, [0, 1], [1, 6]);
  const scale8 = useTransform(scrollYProgress, [0, 1], [1, 8]);
  const scale9 = useTransform(scrollYProgress, [0, 1], [1, 9]);

  const scales = [scale5, scale6, scale5, scale6, scale8, scale9];

  return (
    <div ref={container} className="relative h-[200vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        {images.map(({ src, alt, objectPosition = 'top center' }, index) => {
          const scale = scales[index % scales.length];
          return (
            <motion.div
              key={index}
              style={{ scale }}
              className={`absolute top-0 flex h-full w-full items-center
              justify-center ${index === 0 ? '[&>div]:!-top-[30vh] [&>div]:!left-[5vw] [&>div]:!h-[30vh] [&>div]:!w-[35vw]' : ''}
              ${index === 1 ? '[&>div]:!-top-[10vh] [&>div]:!-left-[25vw] [&>div]:!h-[45vh] [&>div]:!w-[20vw]' : ''}
              ${index === 2 ? '[&>div]:!left-[27.5vw] [&>div]:!h-[25vh] [&>div]:!w-[25vw]' : ''}
              ${index === 3 ? '[&>div]:!top-[27.5vh] [&>div]:!left-[5vw] [&>div]:!h-[25vh] [&>div]:!w-[20vw]' : ''}
              ${index === 4 ? '[&>div]:!top-[27.5vh] [&>div]:!-left-[22.5vw] [&>div]:!h-[25vh] [&>div]:!w-[30vw]' : ''}
              ${index === 5 ? '[&>div]:!top-[22.5vh] [&>div]:!left-[25vw] [&>div]:!h-[15vh] [&>div]:!w-[15vw]' : ''}`}
            >
              <div className="relative h-[25vh] w-[25vw] overflow-hidden">
                <img
                  src={src}
                  alt={alt || ''}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: objectPosition || 'center center',
                  }}
                  draggable={false}
                />
              </div>
            </motion.div>
          );
        })}
        <div className="absolute bottom-0 left-0 w-full h-[20vh]
        bg-gradient-to-b from-transparent to-black pointer-events-none z-10" />
      </div>
    </div>
  );
}

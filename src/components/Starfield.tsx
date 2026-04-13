import { useEffect, useRef } from "react";
import { STAR_COUNT, STREAM_COUNT, PARTICLES_PER_STREAM } from "@/config";

interface Star {
  x: number;
  y: number;
  radius: number;
  glowRadius: number;
  alpha: number;
  alphaBase: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

interface StreamParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  radius: number;
  alpha: number;
}

function createStar(w: number, h: number): Star {
  const isBright = Math.random() < 0.15;
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    radius: isBright ? 1.2 + Math.random() * 1.5 : 0.4 + Math.random() * 0.8,
    glowRadius: isBright ? 6 + Math.random() * 10 : 2 + Math.random() * 4,
    alpha: 0.3 + Math.random() * 0.7,
    alphaBase: 0.3 + Math.random() * 0.4,
    twinkleSpeed: 0.3 + Math.random() * 1.5,
    twinklePhase: Math.random() * Math.PI * 2,
  };
}

function createStreamParticle(
  originX: number,
  originY: number,
  angle: number,
  spread: number
): StreamParticle {
  const a = angle + (Math.random() - 0.5) * spread;
  const speed = 0.15 + Math.random() * 0.4;
  return {
    x: originX + (Math.random() - 0.5) * 60,
    y: originY + (Math.random() - 0.5) * 60,
    vx: Math.cos(a) * speed,
    vy: Math.sin(a) * speed,
    life: Math.random() * 200,
    maxLife: 200 + Math.random() * 300,
    radius: 0.3 + Math.random() * 0.8,
    alpha: 0.2 + Math.random() * 0.5,
  };
}

const Starfield = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId = 0;
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const w = () => window.innerWidth;
    const h = () => window.innerHeight;

    // Create stars
    const stars: Star[] = Array.from({ length: STAR_COUNT }, () =>
      createStar(w(), h())
    );

    // Create streams — each stream is a group of particles flowing in a direction
    const streams: { originX: number; originY: number; angle: number; particles: StreamParticle[] }[] = [];
    for (let i = 0; i < STREAM_COUNT; i++) {
      const originX = Math.random() * w();
      const originY = Math.random() * h();
      const angle = Math.random() * Math.PI * 2;
      const particles: StreamParticle[] = Array.from(
        { length: PARTICLES_PER_STREAM },
        () => createStreamParticle(originX, originY, angle, 0.6)
      );
      streams.push({ originX, originY, angle, particles });
    }

    let time = 0;

    const draw = () => {
      time += 0.016;
      ctx.clearRect(0, 0, w(), h());

      // Draw stars
      for (const star of stars) {
        const twinkle =
          star.alphaBase +
          (star.alpha - star.alphaBase) *
            (0.5 + 0.5 * Math.sin(time * star.twinkleSpeed + star.twinklePhase));

        // Glow
        const grad = ctx.createRadialGradient(
          star.x, star.y, 0,
          star.x, star.y, star.glowRadius
        );
        grad.addColorStop(0, `rgba(100, 180, 255, ${twinkle * 0.5})`);
        grad.addColorStop(0.4, `rgba(80, 150, 255, ${twinkle * 0.2})`);
        grad.addColorStop(1, `rgba(60, 120, 255, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = `rgba(180, 220, 255, ${twinkle})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw stream particles
      for (const stream of streams) {
        for (const p of stream.particles) {
          p.x += p.vx;
          p.y += p.vy;
          p.life += 1;

          if (p.life > p.maxLife) {
            // Reset particle
            p.x = stream.originX + (Math.random() - 0.5) * 60;
            p.y = stream.originY + (Math.random() - 0.5) * 60;
            p.life = 0;
            p.maxLife = 200 + Math.random() * 300;
          }

          const lifeRatio = p.life / p.maxLife;
          // Fade in then fade out
          const fadeAlpha =
            lifeRatio < 0.1
              ? lifeRatio / 0.1
              : lifeRatio > 0.7
              ? (1 - lifeRatio) / 0.3
              : 1;

          const a = p.alpha * fadeAlpha;

          // Tiny glow
          const sg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 3);
          sg.addColorStop(0, `rgba(100, 180, 255, ${a * 0.6})`);
          sg.addColorStop(1, `rgba(60, 140, 255, 0)`);
          ctx.fillStyle = sg;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
          ctx.fill();

          // Core dot
          ctx.fillStyle = `rgba(160, 210, 255, ${a})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 9999,
      }}
    />
  );
};

export default Starfield;

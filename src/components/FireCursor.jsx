import { useEffect, useRef } from 'react';

const FireCursor = () => {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: -100, y: -100 });
  const animationRef = useRef(null);
  const time = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    const drawFlame = (cx, cy, t) => {
      // Small flame — total height ~18px, width ~10px
      // Flicker using sine
      const flicker1 = Math.sin(t * 8) * 1.2;
      const flicker2 = Math.cos(t * 11) * 0.8;
      const flicker3 = Math.sin(t * 15) * 0.5;

      // Outer flame (orange-red)
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy - 14 + flicker1);                          // tip
      ctx.bezierCurveTo(cx + 6 + flicker3, cy - 8, cx + 5, cy + 2, cx, cy + 4);
      ctx.bezierCurveTo(cx - 5, cy + 2, cx - 6 - flicker3, cy - 8, cx, cy - 14 + flicker1);
      ctx.closePath();

      const outerGrad = ctx.createLinearGradient(cx, cy - 14, cx, cy + 4);
      outerGrad.addColorStop(0, 'rgba(255, 80, 0, 0.9)');
      outerGrad.addColorStop(0.4, 'rgba(255, 140, 0, 0.85)');
      outerGrad.addColorStop(1, 'rgba(255, 60, 10, 0.3)');
      ctx.fillStyle = outerGrad;
      ctx.shadowColor = 'rgba(255, 120, 0, 0.4)';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.restore();

      // Middle flame (yellow-orange)
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy - 11 + flicker2);
      ctx.bezierCurveTo(cx + 4, cy - 6, cx + 3.5, cy + 1, cx, cy + 3);
      ctx.bezierCurveTo(cx - 3.5, cy + 1, cx - 4, cy - 6, cx, cy - 11 + flicker2);
      ctx.closePath();

      const midGrad = ctx.createLinearGradient(cx, cy - 11, cx, cy + 3);
      midGrad.addColorStop(0, 'rgba(255, 200, 0, 0.95)');
      midGrad.addColorStop(0.5, 'rgba(255, 160, 20, 0.8)');
      midGrad.addColorStop(1, 'rgba(255, 120, 0, 0.2)');
      ctx.fillStyle = midGrad;
      ctx.fill();
      ctx.restore();

      // Inner core (bright white-yellow)
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy - 7 + flicker3);
      ctx.bezierCurveTo(cx + 2.2, cy - 4, cx + 2, cy + 1, cx, cy + 2.5);
      ctx.bezierCurveTo(cx - 2, cy + 1, cx - 2.2, cy - 4, cx, cy - 7 + flicker3);
      ctx.closePath();

      const innerGrad = ctx.createLinearGradient(cx, cy - 7, cx, cy + 2.5);
      innerGrad.addColorStop(0, 'rgba(255, 255, 220, 1)');
      innerGrad.addColorStop(0.6, 'rgba(255, 240, 140, 0.9)');
      innerGrad.addColorStop(1, 'rgba(255, 200, 50, 0.1)');
      ctx.fillStyle = innerGrad;
      ctx.fill();
      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time.current += 0.016;

      // Tiny warm glow
      const glow = ctx.createRadialGradient(
        mouse.current.x, mouse.current.y - 4, 0,
        mouse.current.x, mouse.current.y - 4, 14
      );
      glow.addColorStop(0, 'rgba(255, 160, 30, 0.12)');
      glow.addColorStop(1, 'rgba(255, 80, 0, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(mouse.current.x, mouse.current.y - 4, 14, 0, Math.PI * 2);
      ctx.fill();

      drawFlame(mouse.current.x, mouse.current.y, time.current);

      animationRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 99999,
      }}
    />
  );
};

export default FireCursor;

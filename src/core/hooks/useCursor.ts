import { useEffect } from 'react';

export const useCursor = () => {
  useEffect(() => {
    const cursor = document.querySelector('.cursor') as HTMLElement;
    const follower = document.querySelector('.cursor-follower') as HTMLElement;
    if (!cursor || !follower) return;

    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.left = `${mouseX}px`;
      cursor.style.top = `${mouseY}px`;
    };

    const animate = () => {
      followerX += (mouseX - followerX) * 0.12;
      followerY += (mouseY - followerY) * 0.12;
      follower.style.left = `${followerX}px`;
      follower.style.top = `${followerY}px`;
      requestAnimationFrame(animate);
    };

    const onEnter = () => { cursor.classList.add('hovering'); follower.classList.add('hovering'); };
    const onLeave = () => { cursor.classList.remove('hovering'); follower.classList.remove('hovering'); };

    document.addEventListener('mousemove', onMove);
    document.querySelectorAll('a, button, [data-hover]').forEach(el => {
      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
    });

    animate();
    return () => { document.removeEventListener('mousemove', onMove); };
  }, []);
};

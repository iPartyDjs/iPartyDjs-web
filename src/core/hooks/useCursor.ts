import { useEffect } from "react";

export const useCursor = (enabled: boolean = true) => {
  useEffect(() => {
    if (!enabled) return;

    // 1. Obtener o crear los elementos del cursor si no existen en el DOM
    let cursor = document.querySelector(".cursor") as HTMLElement | null;
    let follower = document.querySelector(
      ".cursor-follower",
    ) as HTMLElement | null;

    let autoCreatedCursor = false;
    let autoCreatedFollower = false;

    if (!cursor) {
      cursor = document.createElement("div");
      cursor.className = "cursor";
      document.body.appendChild(cursor);
      autoCreatedCursor = true;
    }

    if (!follower) {
      follower = document.createElement("div");
      follower.className = "cursor-follower";
      document.body.appendChild(follower);
      autoCreatedFollower = true;
    }

    // Ocultar cursor nativo
    document.body.classList.add("public-cursor");

    let mouseX = -100;
    let mouseY = -100;
    let followerX = -100;
    let followerY = -100;
    let isVisible = false;
    let rafId = 0;

    // Posición inicial oculta
    cursor.style.opacity = "0";
    follower.style.opacity = "0";

    // 2. Evento de movimiento del mouse acelerado por GPU (translate3d)
    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isVisible) {
        isVisible = true;
        cursor!.style.opacity = "1";
        follower!.style.opacity = "0.5";
        followerX = mouseX;
        followerY = mouseY;
      }

      cursor!.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    };

    // 3. Animación fluida para el seguidor (Smooth Rerender)
    const animate = () => {
      followerX += (mouseX - followerX) * 0.15;
      followerY += (mouseY - followerY) * 0.15;
      follower!.style.transform = `translate3d(${followerX}px, ${followerY}px, 0) translate(-50%, -50%)`;
      rafId = requestAnimationFrame(animate);
    };

    // 4. Delegación de eventos dinámicos para elementos interactivos (a, button, etc.)
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        target.closest(
          "a, button, [data-hover], input, textarea, select, .btn, [role='button'], .mc-filter-btn, .er-type-btn, .ipdj-btn-gold, .ipdj-filter-btn, .ipdj-act-btn, .ipdj-page-btn, .ipdj-btn-save, .ipdj-btn-danger, .ipdj-table-wrap tbody tr",
        )
      ) {
        cursor!.classList.add("hovering");
        follower!.classList.add("hovering");
      } else {
        cursor!.classList.remove("hovering");
        follower!.classList.remove("hovering");
      }
    };

    // 5. Manejo del foco cuando el cursor entra o sale de la ventana del navegador
    const onMouseLeaveWindow = () => {
      isVisible = false;
      cursor!.style.opacity = "0";
      follower!.style.opacity = "0";
    };

    const onMouseEnterWindow = () => {
      isVisible = true;
      cursor!.style.opacity = "1";
      follower!.style.opacity = "0.5";
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseover", onMouseOver, { passive: true });
    document.addEventListener("mouseleave", onMouseLeaveWindow);
    document.addEventListener("mouseenter", onMouseEnterWindow);

    animate();

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseleave", onMouseLeaveWindow);
      document.removeEventListener("mouseenter", onMouseEnterWindow);

      if (rafId) cancelAnimationFrame(rafId);
      document.body.classList.remove("public-cursor");

      if (autoCreatedCursor && cursor) cursor.remove();
      if (autoCreatedFollower && follower) follower.remove();
    };
  }, [enabled]);
};

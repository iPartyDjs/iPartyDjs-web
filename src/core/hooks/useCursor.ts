import { useEffect } from "react";

export const useCursor = (enabled: boolean = true) => {
    useEffect(() => {
        if (!enabled) return;

        const cursor = document.querySelector(".cursor") as HTMLElement | null;
        const follower = document.querySelector(
            ".cursor-follower",
        ) as HTMLElement | null;
        if (!cursor || !follower) return;

        // add class to body so scoped CSS can hide the native cursor
        document.body.classList.add("public-cursor");

        let mouseX = 0,
            mouseY = 0;
        let followerX = 0,
            followerY = 0;
        let rafId = 0;

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
            rafId = requestAnimationFrame(animate);
        };

        const onEnter = () => {
            cursor.classList.add("hovering");
            follower.classList.add("hovering");
        };
        const onLeave = () => {
            cursor.classList.remove("hovering");
            follower.classList.remove("hovering");
        };

        document.addEventListener("mousemove", onMove);
        const hoverEls = Array.from(
            document.querySelectorAll("a, button, [data-hover]"),
        ) as HTMLElement[];
        hoverEls.forEach((el) => {
            el.addEventListener("mouseenter", onEnter);
            el.addEventListener("mouseleave", onLeave);
        });

        animate();

        return () => {
            document.removeEventListener("mousemove", onMove);
            hoverEls.forEach((el) => {
                el.removeEventListener("mouseenter", onEnter);
                el.removeEventListener("mouseleave", onLeave);
            });
            if (rafId) cancelAnimationFrame(rafId);
            document.body.classList.remove("public-cursor");
        };
    }, [enabled]);
};

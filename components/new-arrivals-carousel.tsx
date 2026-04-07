"use client";

import { useEffect, useMemo, useRef } from "react";

import { NewArrivalCard } from "@/components/new-arrival-card";
import type { Card } from "@/lib/types";

type NewArrivalsCarouselProps = {
  cards: Card[];
};

const AUTO_SCROLL_PX_PER_SECOND = 22;
const RESUME_DELAY_MS = 2200;

export function NewArrivalsCarousel({ cards }: NewArrivalsCarouselProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pauseUntilRef = useRef(0);
  const isPointerDownRef = useRef(false);
  const initializedRef = useRef(false);

  const loopCards = useMemo(() => {
    if (cards.length <= 1) {
      return cards.map((card, index) => ({ card, copy: 1, index }));
    }

    return [0, 1, 2].flatMap((copy) =>
      cards.map((card, index) => ({
        card,
        copy,
        index,
      })),
    );
  }, [cards]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container || cards.length <= 1) {
      return;
    }

    let frameId = 0;
    let lastTime = 0;

    const getSegmentWidth = () => container.scrollWidth / 3;

    const normalizeScrollPosition = () => {
      const segmentWidth = getSegmentWidth();

      if (segmentWidth <= 0) {
        return;
      }

      if (!initializedRef.current) {
        container.scrollLeft = segmentWidth;
        initializedRef.current = true;
        return;
      }

      if (container.scrollLeft < segmentWidth * 0.5) {
        container.scrollLeft += segmentWidth;
      } else if (container.scrollLeft > segmentWidth * 1.5) {
        container.scrollLeft -= segmentWidth;
      }
    };

    const pauseAutoScroll = (duration = RESUME_DELAY_MS) => {
      pauseUntilRef.current = window.performance.now() + duration;
    };

    const tick = (time: number) => {
      if (!lastTime) {
        lastTime = time;
      }

      const delta = time - lastTime;
      lastTime = time;

      normalizeScrollPosition();

      if (!isPointerDownRef.current && time >= pauseUntilRef.current) {
        container.scrollLeft += (AUTO_SCROLL_PX_PER_SECOND * delta) / 1000;
        normalizeScrollPosition();
      }

      frameId = window.requestAnimationFrame(tick);
    };

    const handlePointerDown = () => {
      isPointerDownRef.current = true;
      pauseAutoScroll();
    };

    const handlePointerUp = () => {
      isPointerDownRef.current = false;
      pauseAutoScroll();
    };

    const handleTouchStart = () => {
      isPointerDownRef.current = true;
      pauseAutoScroll();
    };

    const handleTouchEnd = () => {
      isPointerDownRef.current = false;
      pauseAutoScroll();
    };

    const handleWheel = () => {
      pauseAutoScroll();
    };

    normalizeScrollPosition();
    pauseAutoScroll(1200);

    container.addEventListener("pointerdown", handlePointerDown);
    container.addEventListener("wheel", handleWheel, { passive: true });
    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("resize", normalizeScrollPosition);

    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameId);
      container.removeEventListener("pointerdown", handlePointerDown);
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("resize", normalizeScrollPosition);
      initializedRef.current = false;
    };
  }, [cards]);

  if (cards.length === 0) {
    return null;
  }

  return (
    <div className="-mx-4 px-4 md:mx-0 md:px-0">
      <div
        ref={containerRef}
        className="no-scrollbar flex gap-3 overflow-x-auto pb-1 pr-4 [scrollbar-width:none] [-ms-overflow-style:none] touch-pan-x md:pr-0"
      >
        {loopCards.map(({ card, copy, index }) => (
          <div
            key={`${card.id}-${copy}-${index}`}
            className="w-[140px] flex-none md:w-[148px] xl:w-[156px]"
            aria-hidden={cards.length > 1 && copy !== 1}
          >
            <NewArrivalCard card={card} />
          </div>
        ))}
      </div>
    </div>
  );
}

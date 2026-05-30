"use client";

import type { PointerEvent, RefObject } from "react";
import { CarouselSlide, DEFAULT_CAROUSEL_LOGO } from "@/types/carousel";

interface CarouselSlidePreviewProps {
  slide: CarouselSlide;
  currentSlideIndex: number;
  totalSlides: number;
  previewRef?: RefObject<HTMLDivElement | null>;
  onChange?: (updated: CarouselSlide) => void;
  showPagination?: boolean;
}

const LOGO_SRC = "/digytalab-logo.png";

export function CarouselSlidePreview({ slide, currentSlideIndex, totalSlides, previewRef, onChange, showPagination = true }: CarouselSlidePreviewProps) {
  const logoX = slide.logoX ?? DEFAULT_CAROUSEL_LOGO.logoX;
  const logoY = slide.logoY ?? DEFAULT_CAROUSEL_LOGO.logoY;
  const logoSize = slide.logoSize ?? DEFAULT_CAROUSEL_LOGO.logoSize;
  const showLogo = slide.showLogo ?? DEFAULT_CAROUSEL_LOGO.showLogo;

  const handleLogoPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!onChange) return;

    const container = event.currentTarget.closest("[data-carousel-preview='true']");
    if (!(container instanceof HTMLElement)) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);

    updateLogoPosition(event, container);
  };

  const handleLogoPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!onChange || !event.currentTarget.hasPointerCapture(event.pointerId)) return;

    const container = event.currentTarget.closest("[data-carousel-preview='true']");
    if (!(container instanceof HTMLElement)) return;

    updateLogoPosition(event, container);
  };

  const updateLogoPosition = (event: PointerEvent<HTMLDivElement>, container: HTMLElement) => {
    const bounds = container.getBoundingClientRect();
    const nextX = ((event.clientX - bounds.left) / bounds.width) * 100;
    const nextY = ((event.clientY - bounds.top) / bounds.height) * 100;

    onChange?.({
      ...slide,
      logoX: clamp(nextX, 5, 95),
      logoY: clamp(nextY, 5, 95),
    });
  };

  return (
    <div 
      ref={previewRef}
      data-carousel-preview="true"
      className="bg-white overflow-hidden flex flex-col relative mx-auto shadow-md"
      style={{ 
        width: "360px", 
        height: "450px", // aspect ratio 4:5 (1080x1350 is 4:5, so 360x450 is exact scale)
        zoom: 1 // for export later
      }} 
    >
      {/* Background Image if exists */}
      {slide.imageDataUrl && (
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${slide.imageDataUrl})` }}
        />
      )}
      
      {/* Overlay gradient so text is readable */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />

      {showLogo && (
        <div
          aria-label="DigytaLab"
          onPointerDown={handleLogoPointerDown}
          onPointerMove={handleLogoPointerMove}
          className={onChange ? "absolute z-30 flex cursor-grab select-none items-center gap-1 rounded-md bg-white/18 px-1.5 py-1 shadow-md ring-1 ring-white/25 backdrop-blur-[1px] touch-none active:cursor-grabbing" : "absolute z-30 flex select-none items-center gap-1 rounded-md bg-white/18 px-1.5 py-1 shadow-md ring-1 ring-white/25 backdrop-blur-[1px]"}
          style={{
            left: `${logoX}%`,
            top: `${logoY}%`,
            width: `${logoSize}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div
            className="h-5 w-6 shrink-0 bg-contain bg-center bg-no-repeat drop-shadow"
            style={{ backgroundImage: `url(${LOGO_SRC})` }}
          />
          <span className="min-w-0 text-[11px] font-black leading-none text-white drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.65)]">
            DigytaLab
          </span>
        </div>
      )}

      {/* Content */}
      <div className="relative z-20 flex flex-col justify-end h-full p-8">
        <h2 className="text-3xl font-black text-white leading-tight mb-3">
          {slide.headline || "Headline Text"}
        </h2>
        <p className="text-white/90 text-sm leading-relaxed">
          {slide.body || "Penjelasan body text akan muncul di sini."}
        </p>
      </div>

      {showPagination && (
        <div className="absolute top-4 right-4 z-20 flex gap-1">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full ${i === currentSlideIndex ? "bg-primary" : "bg-white/40"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

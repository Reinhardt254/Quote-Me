"use client";

import { forwardRef, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const CANVAS_SIZE = 1080;

function TagChip({ tag, className }) {
  if (!tag) return null;
  return (
    <span className={cn("text-[28px] font-semibold tracking-wide", className)}>
      #{tag.replace(/^#/, "")}
    </span>
  );
}

function BrandMark({ className }) {
  return (
    <p className={cn("text-[24px] font-semibold", className)}>Quote-Me</p>
  );
}

function QuoteBody({ prompt, className }) {
  return (
    <p
      className={cn(
        "min-w-0 max-w-full break-words font-medium leading-[1.25] [overflow-wrap:anywhere] whitespace-pre-wrap",
        className
      )}
    >
      {prompt || "Your quote will appear here…"}
    </p>
  );
}

function CanvasArt({ prompt, tag, image, layoutKey }) {
  switch (layoutKey) {
    case "gradient":
      return (
        <div className="relative flex h-full w-full flex-col justify-between bg-gradient-to-br from-green-400 via-green-500 to-yellow-400 p-[86px]">
          <TagChip tag={tag} className="text-white/90" />
          <QuoteBody
            prompt={prompt}
            className="text-[54px] text-white drop-shadow"
          />
          <BrandMark className="text-white/80" />
        </div>
      );
    case "poster":
      return (
        <div className="relative flex h-full w-full flex-col justify-between bg-black p-[86px]">
          <div className="h-[8px] w-[96px] rounded-full bg-primary" />
          <QuoteBody
            prompt={prompt}
            className="text-[58px] font-bold text-white"
          />
          <div className="flex items-center justify-between gap-4">
            <TagChip tag={tag} className="text-primary" />
            <BrandMark className="text-white/70" />
          </div>
        </div>
      );
    case "overlay":
      return (
        <div className="relative h-full w-full overflow-hidden bg-foreground">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              crossOrigin="anonymous"
            />
          ) : null}
          <div className="absolute inset-0 bg-black/55" />
          <div className="relative z-10 flex h-full flex-col justify-end gap-6 p-[86px]">
            <QuoteBody prompt={prompt} className="text-[54px] text-white" />
            <TagChip tag={tag} className="text-accent" />
          </div>
        </div>
      );
    case "split":
      return (
        <div className="grid h-full w-full grid-cols-2 bg-card">
          <div className="relative overflow-hidden bg-muted">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-[28px] text-muted-foreground">
                Image
              </div>
            )}
          </div>
          <div className="flex min-w-0 flex-col justify-between p-[64px]">
            <TagChip tag={tag} className="text-secondary" />
            <QuoteBody
              prompt={prompt}
              className="text-[36px] text-foreground"
            />
            <BrandMark className="text-muted-foreground" />
          </div>
        </div>
      );
    case "editorial":
      return (
        <div className="relative flex h-full w-full flex-col justify-between border-[10px] border-primary bg-card p-[72px]">
          <p className="text-[22px] font-bold uppercase tracking-[0.2em] text-secondary">
            Quote-Me Editorial
          </p>
          <QuoteBody
            prompt={prompt}
            className="text-[58px] font-semibold tracking-tight text-foreground"
          />
          <TagChip tag={tag} className="text-primary" />
        </div>
      );
    case "classic":
    default:
      return (
        <div className="relative flex h-full w-full flex-col justify-between bg-white p-[86px]">
          {image ? (
            <div className="relative mb-8 h-[320px] shrink-0 overflow-hidden rounded-[28px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                crossOrigin="anonymous"
              />
            </div>
          ) : (
            <div className="mb-4 h-[8px] w-[120px] rounded-full bg-primary" />
          )}
          <QuoteBody
            prompt={prompt}
            className="min-h-0 flex-1 text-[48px] text-black"
          />
          <div className="mt-8 flex items-center justify-between gap-4 border-t border-black/10 pt-8">
            <TagChip tag={tag} className="text-green-600" />
            <BrandMark className="text-black/60" />
          </div>
        </div>
      );
  }
}

const QuoteCanvas = forwardRef(function QuoteCanvas(
  {
    prompt = "",
    tag = "",
    image = "",
    layoutKey = "classic",
    className,
    size = "preview",
  },
  ref
) {
  const isExport = size === "export";
  const shellRef = useRef(null);
  const [scale, setScale] = useState(null);

  useLayoutEffect(() => {
    if (isExport) return undefined;
    const node = shellRef.current;
    if (!node) return undefined;

    const update = () => {
      const width = node.clientWidth || CANVAS_SIZE;
      setScale(Math.max(width / CANVAS_SIZE, 0.01));
    };

    update();

    if (typeof ResizeObserver === "undefined") return undefined;

    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [isExport]);

  const art = (
    <CanvasArt
      prompt={prompt}
      tag={tag}
      image={image}
      layoutKey={layoutKey || "classic"}
    />
  );

  if (isExport) {
    return (
      <div
        ref={ref}
        className={cn(
          "overflow-hidden bg-white shadow-sm ring-1 ring-border",
          className
        )}
        style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
        data-quote-canvas
      >
        {art}
      </div>
    );
  }

  return (
    <div
      ref={shellRef}
      className={cn(
        "relative aspect-square w-full max-w-md overflow-hidden rounded-xl bg-muted/30 shadow-sm ring-1 ring-border",
        className
      )}
    >
      <div
        ref={ref}
        className={cn(
          "absolute left-0 top-0 origin-top-left overflow-hidden bg-white transition-opacity",
          scale ? "opacity-100" : "opacity-0"
        )}
        style={{
          width: CANVAS_SIZE,
          height: CANVAS_SIZE,
          transform: `scale(${scale || 0.01})`,
        }}
        data-quote-canvas
      >
        {art}
      </div>
    </div>
  );
});

export default QuoteCanvas;

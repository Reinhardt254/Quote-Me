"use client";

import { toPng } from "html-to-image";

export async function downloadQuoteAsPng(node, filename = "quote-me.png") {
  if (!node) {
    throw new Error("Quote canvas not ready");
  }

  const dataUrl = await toPng(node, {
    cacheBust: true,
    pixelRatio: 1,
    width: 1080,
    height: 1080,
    style: {
      transform: "none",
      width: "1080px",
      height: "1080px",
    },
  });

  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

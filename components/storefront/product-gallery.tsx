"use client";

import Image from "next/image";
import { useState } from "react";
export type GalleryImage = { src: string; alt: string };
export function ProductGallery({ images, productName }: { images: GalleryImage[]; productName: string }) {
  const [selected, setSelected] = useState(0);
  const activeIndex = images[selected] ? selected : 0;
  const image = images[activeIndex];
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const advance = (delta: number) => setSelected((activeIndex + delta + images.length) % images.length);
  return <section className="product-gallery" aria-label={`${productName} images`}>
    {image ? <><div className="product-gallery__main" onTouchStart={(event) => { event.currentTarget.dataset.touchStart = String(event.touches[0]?.clientX ?? 0); }} onTouchEnd={(event) => { const start = Number(event.currentTarget.dataset.touchStart); const delta = (event.changedTouches[0]?.clientX ?? start) - start; if (Math.abs(delta) > 48 && images.length > 1) advance(delta < 0 ? 1 : -1); }}>
      {failedSrc === image.src ? <div className="product-gallery__empty" role="status">This product image could not be loaded.</div> : <Image src={image.src} alt={image.alt} fill sizes="(max-width: 767px) 100vw, 55vw" priority={activeIndex === 0} unoptimized className="product-gallery__image" onError={() => setFailedSrc(image.src)} />}
      <span className="product-gallery__count" aria-live="polite">{activeIndex + 1} / {images.length}</span><button className="product-gallery__step product-gallery__step--prev" type="button" aria-label="Previous image" onClick={() => advance(-1)} disabled={images.length < 2}>‹</button><button className="product-gallery__step product-gallery__step--next" type="button" aria-label="Next image" onClick={() => advance(1)} disabled={images.length < 2}>›</button></div><div className="product-gallery__thumbs" role="group" aria-label="Choose product image">{images.map((item, index) => <button key={`${item.src}-${index}`} type="button" className={`product-gallery__thumb${index === activeIndex ? " is-selected" : ""}`} onClick={() => setSelected(index)} aria-label={`Show image ${index + 1}: ${item.alt}`} aria-pressed={index === activeIndex}><Image src={item.src} alt="" fill sizes="72px" unoptimized /></button>)}</div></> : <div className="product-gallery__empty" role="status">Product images are not available.</div>}
  </section>;
}

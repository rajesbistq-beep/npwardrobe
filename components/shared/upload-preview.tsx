import Image from "next/image";
export function UploadPreview({ src, alt, fileName, description }: { src?: string | null; alt: string; fileName?: string; description?: string }) {
  return <figure className="upload-preview">{src ? <Image src={src} alt={alt} fill sizes="(max-width: 767px) 90vw, 360px" unoptimized /> : <div className="upload-preview__empty" role="status">Preview unavailable</div>}<figcaption>{fileName && <strong>{fileName}</strong>}{description && <span>{description}</span>}</figcaption></figure>;
}

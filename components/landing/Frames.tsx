import Image, { StaticImageData } from 'next/image';

interface FrameProps {
  src: StaticImageData;
  alt: string;
  className?: string;
  /** Classes for the image itself, e.g. to crop with object-position */
  imageClassName?: string;
  priority?: boolean;
  sizes?: string;
}

// A desktop screenshot in a plain browser window
export function BrowserFrame({ src, alt, className = '', imageClassName = '', priority, sizes = '(min-width: 1024px) 60vw, 100vw' }: FrameProps) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl shadow-black/10 ${className}`}>
      <div className="flex h-8 items-center gap-1.5 border-b border-black/5 bg-[#f3f1ec] px-3" aria-hidden="true">
        <span className="h-2.5 w-2.5 rounded-full bg-black/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-black/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-black/15" />
      </div>
      <Image src={src} alt={alt} priority={priority} sizes={sizes} className={`block w-full ${imageClassName}`} />
    </div>
  );
}

// A phone screenshot in a phone-shaped frame
export function PhoneFrame({ src, alt, className = '', imageClassName = '', priority, sizes = '280px' }: FrameProps) {
  return (
    <div className={`overflow-hidden rounded-[2.25rem] border-[6px] border-[var(--ink)] bg-[var(--ink)] shadow-2xl shadow-black/25 ${className}`}>
      <Image src={src} alt={alt} priority={priority} sizes={sizes} className={`block w-full rounded-[1.75rem] ${imageClassName}`} />
    </div>
  );
}

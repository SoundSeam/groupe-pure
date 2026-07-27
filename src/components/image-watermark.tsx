import Image from "next/image";

export function ImageWatermark({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      data-cms-ignore
      className={`pointer-events-none absolute right-3 bottom-3 z-20 block w-[26%] min-w-20 max-w-32 opacity-[0.68] drop-shadow-[0_2px_6px_rgba(0,0,0,0.75)] select-none sm:right-4 sm:bottom-4 ${className}`}
    >
      <Image
        src="/brand/logo-horizontal.png"
        alt=""
        width={1724}
        height={513}
        sizes="128px"
        className="h-auto w-full"
      />
    </span>
  );
}

"use client";

import Image from "next/image";
import { useState } from "react";
import { photoUrl, POSE_LABELS } from "@/lib/domain/posts";

export function Gallery({ photos }: { photos: { path: string; pose: string | null }[] }) {
  const [index, setIndex] = useState(0);
  return (
    <div className="relative">
      <div
        className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
        onScroll={(e) => {
          const el = e.currentTarget;
          setIndex(Math.round(el.scrollLeft / el.clientWidth));
        }}
      >
        {photos.map((p, i) => (
          <div key={p.path} className="relative aspect-[3/4] w-full shrink-0 snap-center bg-placeholder">
            <Image src={photoUrl(p.path)!} alt={p.pose ? POSE_LABELS[p.pose] : "Kombin fotoğrafı"} fill sizes="(max-width: 448px) 100vw, 448px" className="object-cover" priority={i === 0} />
            {p.pose && p.pose !== "other" && (
              <span className="absolute bottom-3 left-3 rounded-full bg-ink/50 px-2 py-0.5 text-[11px] text-cream">{POSE_LABELS[p.pose]}</span>
            )}
          </div>
        ))}
      </div>
      {photos.length > 1 && (
        <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
          {photos.map((p, i) => (
            <span key={p.path} className={`h-1.5 rounded-full transition-all ${i === index ? "w-4 bg-cream" : "w-1.5 bg-cream/60"}`} />
          ))}
        </div>
      )}
    </div>
  );
}

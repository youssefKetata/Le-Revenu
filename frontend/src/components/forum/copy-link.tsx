"use client";

import { useState } from "react";
import Icon from "@/components/ui/icon";

export default function CopyLink() {
  const [status, setStatus] = useState("");
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        className="inline-flex min-h-8 items-center gap-1.5 rounded-lg px-[11px] text-[13.5px] font-medium text-secondary hover:bg-fill [@media(pointer:coarse)]:min-h-10"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(window.location.href);
            setStatus("Lien copié");
          } catch {
            setStatus("Copiez le lien depuis la barre d’adresse.");
          }
        }}
      >
        <Icon name="external" />
        Copier le lien
      </button>
      <span role="status" className="text-[12.5px] text-muted">
        {status}
      </span>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Icon from "@/components/ui/icon";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const DismissContext = createContext<(() => void) | null>(null);

export default function Modal({
  title,
  narrow = false,
  children,
}: {
  title: string;
  narrow?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(true);
  const mounted = useRef(true);
  const router = useRouter();
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const dismiss = () => setOpen(false);
  return (
    <DismissContext value={dismiss}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className={narrow ? "max-w-[440px]" : undefined}
          aria-describedby={undefined}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            // Radix calls this after its exit animation, including reduced motion.
            // Route changes (including Back during an exit) must not navigate twice.
            if (!open && mounted.current) router.back();
          }}
        >
          <DialogTitle className="sr-only">{title}</DialogTitle>
          {children}
        </DialogContent>
      </Dialog>
    </DismissContext>
  );
}

export function FormCloseButton() {
  const dismiss = useContext(DismissContext);
  const className =
    "grid size-9 shrink-0 place-items-center rounded-[9px] text-secondary hover:bg-fill [@media(pointer:coarse)]:size-11";
  return dismiss ? (
    <button
      type="button"
      onClick={dismiss}
      aria-label="Fermer"
      className={className}
    >
      <Icon name="close" />
    </button>
  ) : (
    <Link
      href="/"
      aria-label="Fermer et revenir à la communauté"
      className={className}
    >
      <Icon name="close" />
    </Link>
  );
}

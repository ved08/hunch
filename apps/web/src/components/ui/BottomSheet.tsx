import { type ReactNode, useEffect } from "react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

export function BottomSheet({ open, onClose, children, title }: BottomSheetProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-bg-secondary rounded-t-2xl border-t border-border-light animate-slide-up">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-8 h-0.5 rounded-full bg-text-muted/30" />
        </div>
        {title && (
          <h3 className="px-5 pb-3 text-base font-semibold text-text-primary">
            {title}
          </h3>
        )}
        <div className="px-5 pb-8">{children}</div>
      </div>
    </div>
  );
}

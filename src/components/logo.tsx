import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="w-6 h-6 rounded-md overflow-hidden" style={{ background: "rgba(255,255,255,0.03)" }}>
  <img src="/images/logo_project.svg" alt="ChronoDietAI Logo" className="w-full h-full object-contain" />
      </div>
      <span className="font-headline text-xl font-bold text-foreground">
        ChronoDietAI
      </span>
    </div>
  );
}
interface LogoProps {
  withText?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
}

export function Logo({ withText = true, size = "md" }: LogoProps) {
  const sizes = {
    xs: {
      container: "h-6",
      icon: "h-6 w-6",
      text: "text-sm",
    },
    sm: {
      container: "h-8",
      icon: "h-8 w-8",
      text: "text-lg",
    },
    md: {
      container: "h-10",
      icon: "h-10 w-10",
      text: "text-xl",
    },
    lg: {
      container: "h-12",
      icon: "h-12 w-12",
      text: "text-2xl",
    },
  };

  const sizeConfig = sizes[size];

  return (
    <div className="flex items-center gap-2">
      <img
        src="/icon.png"
        alt="x402.chat"
        className={`${sizeConfig.icon} shrink-0`}
      />

      {/* Text */}
      {withText && (
        <span
          className={`font-bold text-zinc-900 dark:text-zinc-100 ${sizeConfig.text}`}
        >
          x402.chat
        </span>
      )}
    </div>
  );
}

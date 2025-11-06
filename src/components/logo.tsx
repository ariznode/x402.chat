import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  withText?: boolean;
  size?: "sm" | "md" | "lg";
}

export function Logo({ withText = true, size = "md" }: LogoProps) {
  const sizes = {
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
    <Link
      href="/"
      className="flex items-center gap-2 transition-opacity hover:opacity-80"
    >
      <Image
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
    </Link>
  );
}

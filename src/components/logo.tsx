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
      {/* Chat Bubble Icon with Gradient Backdrop */}
      <div className={`relative ${sizeConfig.icon} shrink-0`}>
        <svg
          role="presentation"
          viewBox="0 0 100 100"
          className="h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Light mode gradient */}
            <radialGradient id="logo-gradient-light" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#ddd6fe" stopOpacity="1" />
              <stop offset="50%" stopColor="#c4b5fd" stopOpacity="1" />
              <stop offset="100%" stopColor="#a78bfa" stopOpacity="1" />
            </radialGradient>
            {/* Dark mode gradient */}
            <radialGradient id="logo-gradient-dark" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#7c3aed" stopOpacity="1" />
              <stop offset="50%" stopColor="#6d28d9" stopOpacity="1" />
              <stop offset="100%" stopColor="#5b21b6" stopOpacity="1" />
            </radialGradient>
          </defs>

          {/* Gradient backdrop circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            className="fill-[url(#logo-gradient-light)] dark:fill-[url(#logo-gradient-dark)]"
          />

          {/* Chat bubble shape - white with shadow */}
          <g className="fill-white dark:fill-zinc-800">
            {/* Main bubble body with rounded corners */}
            <rect
              x="20"
              y="25"
              width="52"
              height="40"
              rx="10"
              ry="10"
              className="drop-shadow-lg"
            />
            {/* Tail/pointer */}
            <path d="M 32 65 L 28 75 L 40 67 Z" className="drop-shadow-lg" />
          </g>

          {/* Message dots inside bubble */}
          <g className="fill-violet-600 dark:fill-violet-300">
            <circle cx="35" cy="45" r="3" />
            <circle cx="50" cy="45" r="3" />
            <circle cx="65" cy="45" r="3" />
          </g>
        </svg>
      </div>

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

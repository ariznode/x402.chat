interface LogoProps {
  withText?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
}

export function Logo({ size = "md" }: LogoProps) {
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
    <img
      src="/icon.png"
      alt="x402.chat"
      className={`${sizeConfig.icon} shrink-0`}
    />
  );
}

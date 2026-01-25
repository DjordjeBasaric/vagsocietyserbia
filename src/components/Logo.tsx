import Image from "next/image";

type LogoProps = {
  size?: number;
  className?: string;
  priority?: boolean;
};

export function Logo({ size = 40, className, priority = true }: LogoProps) {
  return (
    <span className={`inline-flex ${className ?? ""}`}>
      <Image
        src="/logo/vss_logo_black.png"
        alt="VagSocietySerbia"
        width={size}
        height={size}
        className="block dark:hidden"
        priority={priority}
      />
      <Image
        src="/logo/vss_logo_white.png"
        alt="VagSocietySerbia"
        width={size}
        height={size}
        className="hidden dark:block"
        priority={priority}
      />
    </span>
  );
}

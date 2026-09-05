import type { CSSProperties, ReactNode } from "react";

export const FadeIn = ({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) => (
  <div
    className={`memorial-fade-in ${className}`}
    style={{ "--memorial-delay": `${delay}s` } as CSSProperties}
  >
    {children}
  </div>
);

export const FadeInStagger = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => <div className={className}>{children}</div>;

export const FadeInItem = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => <div className={`memorial-fade-in ${className}`}>{children}</div>;

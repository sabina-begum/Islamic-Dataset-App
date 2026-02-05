import React from "react";

interface SkipLinkProps {
  targetId: string;
  children: React.ReactNode;
  className?: string;
}

export const SkipLink: React.FC<SkipLinkProps> = ({
  targetId,
  children,
  className = "",
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className={`sr-only focus:not-sr-only absolute left-2 top-2 z-50 bg-green-600 text-white px-3 py-1 rounded text-sm font-medium ${className}`}
    >
      {children}
    </a>
  );
};

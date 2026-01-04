"use client";

import { type AnchorHTMLAttributes, type ReactNode } from "react";
import { trackOutboundLink } from "~/lib/plausible";

interface OutboundLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: ReactNode;
}

export function OutboundLink({ href, children, onClick, ...props }: OutboundLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    trackOutboundLink(href);
    onClick?.(e);
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      {...props}
    >
      {children}
    </a>
  );
}

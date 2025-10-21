"use client"
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import ModeToggle from '@/components/Theam';

export function MenubarDemo() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const links = [
    { name: "Home", href: "/feed" },
    { name: "Create", href: "/create-post" },
    { name: "Like", href: "/like-posts" },
    { name: "Save", href: "/save-posts" },
    { name: "Profile", href: "/profile" },
  ];

  if (!mounted) {
    // Prevent SSR vs CSR mismatch
    return null;
  }

  return (
    <div className="top-0 left-0 right-0 z-10 flex justify-between items-center border-b fixed h-12 px-4">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`relative pb-1 ${
            pathname === link.href
              ? "underline decoration-blue-500 underline-offset-4 font-semibold"
              : "hover:underline"
          }`}
        >
          {link.name}
        </Link>
      ))}
      <ModeToggle />
    </div>
  );
}
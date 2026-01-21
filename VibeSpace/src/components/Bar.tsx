"use client"
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import ModeToggle from '@/components/Theam';
import { FaUserFriends } from "react-icons/fa";
import { IoNotificationsSharp } from "react-icons/io5";
import { AiTwotoneHome } from "react-icons/ai";
import { MdPersonSearch } from "react-icons/md";
import { GiPowerLightning } from "react-icons/gi";

export function MenubarDemo() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const links = [
    { name: AiTwotoneHome, href: "/feed" },
    { name: GiPowerLightning, href: '/features'},
    { name: FaUserFriends, href:"/requests" },
    { name: IoNotificationsSharp, href:"/notifications" },
  ];

  if (!mounted) {
    // Prevent SSR vs CSR mismatch
    return null;
  }

  return (
    <nav className="w-full bg-background/90 backdrop-blur-sm border sticky top-0 z-30  ">
      <div className='max-w-[1280px] mx-auto py-2 w-full flex justify-between items-center'>
        <div className="flex h-[70%] border-2 w-[23%] border-black round">
          <input type="text " className="border-none outline-none p-1 w-[80%]"/>
          <button className=" w-[20%] bg-blue-300 p-2"><MdPersonSearch /></button>
        </div>
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
            <link.name/>
          </Link>
        ))}
        <ModeToggle />
      </div>
    </nav>
  );
}
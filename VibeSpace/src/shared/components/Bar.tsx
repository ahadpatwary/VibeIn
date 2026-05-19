"use client"
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaUserFriends } from "react-icons/fa";
import { IoNotificationsSharp } from "react-icons/io5";
import { AiTwotoneHome } from "react-icons/ai";
import { MdPersonSearch } from "react-icons/md";
import { GiPowerLightning } from "react-icons/gi";
import ModeToggle from "./Theam";
import { useSearchUser } from "../hooks/useSearchUser";

interface MenuberProps {
  footer?: boolean,
  onSearch?: (query: string) => void
}


export function MenubarDemo({ footer = false, onSearch }: MenuberProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const { searchUser, handleSearchClick } = useSearchUser();


  useEffect(() => {
    setMounted(true);
  }, []);

  const links = [
    { name: AiTwotoneHome, href: "/feed" },
    { name: GiPowerLightning, href: '/features' },
    { name: FaUserFriends, href: "/connection" },
    { name: IoNotificationsSharp, href: "/notifications" },
  ];

  if (!mounted) {
    // Prevent SSR vs CSR mismatch
    return null;
  }

  return (
    <nav className="w-full bg-background/90 backdrop-blur-sm border sticky top-0 z-30">
      <div className='max-w-[1280px] min-w-[310px] mx-auto py-2 w-full flex px-5 justify-between items-center'>
        {!footer && 
        <div className="flex h-[70%] border border-border rounded-lg pl-2 bg-card dark:bg-card">
          <input
            type="text"
            className="border-none outline-none bg-card text-foreground dark:bg-card dark:text-foreground p-1 w-[80%] placeholder-muted-foreground"
            value={query}
            placeholder="Search users..."
            onChange={(e) => {
              setQuery(e.target.value)
              onSearch && onSearch(e.target.value);
            }
            }
          />
          <div 
            className="text-foreground border-l border-border flex justify-center items-center w-[20%] cursor-pointer hover:opacity-80" 
            onClick={() => handleSearchClick("aha")}
          >
            <MdPersonSearch className="size-6" />
          </div>
        </div>}
        <div className={`flex-1 flex justify-around ${!footer && 'hidden md:block'}  `}>
          <div className="w-full flex justify-around">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative pb-1 text-foreground transition-colors ${pathname === link.href
                  ? "underline decoration-primary underline-offset-4 font-semibold"
                  : "hover:underline hover:text-primary"
                  }`}
              >
                <link.name className="size-5" />
              </Link>
            ))}
          </div>
        </div>

        {!footer && <ModeToggle />}
      </div>
    </nav>
  );
}
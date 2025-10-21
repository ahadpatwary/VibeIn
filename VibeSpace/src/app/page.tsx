"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { FaGithub, FaTwitter, FaLinkedin } from "react-icons/fa";
import { useRouter } from "next/navigation"
import Link from "next/link";

export default function DarkLandingPageFull() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950">
      
      {/* Navbar */}
      <nav className="w-full flex items-center justify-between px-8 py-4 bg-gray-900/60 backdrop-blur-md fixed top-0 z-50">
        <h1 className="text-white text-2xl font-bold">MyApp</h1>
        <div className="flex gap-6 text-gray-300">
          <Link href="/login" className="hover:text-white transition">Login</Link>
          <Link href="/register" className="hover:text-white transition">register</Link>
          <Link href="#guest" className="hover:text-white transition">Guest</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex flex-1 items-center justify-center pt-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <Card className="backdrop-blur-xl bg-gray-900/40 border border-gray-700 shadow-lg rounded-2xl">
            <CardContent className="flex flex-col items-center gap-6 p-10">
              <h1 className="text-4xl font-bold text-white tracking-wide">
                Welcome to MyApp
              </h1>
              <p className="text-gray-300 text-center">
                Choose an option to continue. Dark theme ready!
              </p>

              <div className="flex flex-col gap-4 w-full mt-4">
                <Button
                  id="login"
                  variant="default"
                  className="w-full bg-gray-800 text-white hover:bg-gray-700 cursor-pointer"
                  onClick={() => router.push("/login")}
                >
                  Login
                </Button>
                <Button
                  id="register"
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 cursor-pointer"
                  onClick={() => router.push("/register")}
                >
                  register
                </Button>
                <Button
                  id="guest"
                  variant="secondary"
                  className="w-full bg-gray-700 text-white hover:bg-gray-600 cursor-pointer"
                >
                  Continue as Guest
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="w-full py-6 bg-gray-900/70 backdrop-blur-md mt-auto flex flex-col items-center gap-4">
        <div className="flex gap-6 text-gray-300">
          <a href="https://github.com" target="_blank" className="hover:text-white transition">
            <FaGithub size={24} />
          </a>
          <a href="https://twitter.com" target="_blank" className="hover:text-white transition">
            <FaTwitter size={24} />
          </a>
          <a href="https://linkedin.com" target="_blank" className="hover:text-white transition">
            <FaLinkedin size={24} />
          </a>
        </div>
        <p className="text-gray-400 text-sm">&copy; 2025 MyApp. All rights reserved.</p>
      </footer>
    </div>
  );
}

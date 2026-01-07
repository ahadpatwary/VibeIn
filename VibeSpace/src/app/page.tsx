import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { FaGithub, FaTwitter, FaLinkedin } from "react-icons/fa";
import { useRouter } from "next/navigation"
import Link from "next/link";
import { addUserId } from "@/lib/features/userId/userIdSlice";
import { useEffect } from "react";

export default function DarkLandingPageFull() {
  const router = useRouter()

  return (
    <p>Abdul Ahad Patwary Website</p>
  );
}
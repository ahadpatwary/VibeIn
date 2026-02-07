"use client";

import { Login } from "@/modules/auth/frontend/components/login";

export default function Home() {

  return (
    <div className = "h-screen flex justify-center items-center"> 
      <Login />
    </div>
  )
}
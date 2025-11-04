'use client'

import { ResizableDemo } from '@/components/ResizableDemo'
import useFeed from '@/hooks/useFeed';
import { useIsMobile } from "@/hooks/use-mobile";
import { MenubarDemo } from '@/components/Bar';
import { UserProfile } from '@/components/UserProfile';

function Profile (){

  const isMobile = useIsMobile();
  const { data } = useFeed("cards");

  return (
    !isMobile ? (
      <ResizableDemo  post = {data} Dot ={true} />
    ) : (
      <div className="w-full h-dvh flex flex-col">
        <MenubarDemo />
        <UserProfile dot={true}  userId = "" />
      </div>
    )
  )
}

export default Profile;
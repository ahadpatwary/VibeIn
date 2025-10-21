'use client'

import { ResizableDemo } from '@/components/ResizableDemo'
import useFeed from '@/hooks/useFeed';


function Profile (){
  const { data } = useFeed("cards");

  return (
    <>
      <ResizableDemo  post = {data} Dot ={true} />
    </>
  )
}

export default Profile;
'use client'

import { ShowCard } from '@/components/ShowCard';
import { CustomWrapper } from '@/components/CustomWrapper'
import { useSession } from "next-auth/react"
import { useCards }  from '@/hooks/useFetchCards';
import { Card, CardContent } from "@/components/ui/card"
import { UserProfile } from '@/components/UserProfile';
import CarouselDemo from '@/components/Embla';
import { useEffect, useState} from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

function Notification() {
  const { data: session } = useSession()

  const { activeCards } = useCards(session?.user.id!);
  const [hide, setHide] = useState(false);
  const [profileHide, setProfileHide] = useState(false);
  const router = useRouter();

useEffect(() => {
  const handleResize = () => {
    if (window.innerWidth < 1024) {
      setHide(true);
    } else {
      setHide(false);
    }

    if(window.innerWidth < 768){
      setProfileHide(true);
    } else {
      setProfileHide(false);
    }
  };

  // প্রথমবার load হওয়ার সময় check
  handleResize();

  // resize হলে call হবে
  window.addEventListener("resize", handleResize);

  // cleanup (খুব important)
  return () => {
    window.removeEventListener("resize", handleResize);
  };
}, []);

  const handleClick = () => {
    router.push('/create-post');
  }


  return (
    
    <div className='flex max-w-[1280px] justify-around'>
      <>
      {
        !profileHide &&  <Card className='h-[500px] max-w-[35%] flex-1 m-2'>
        <UserProfile dot={true}  userId = "" />
      </Card>
      }
      </>
      <div className="flex-2 ">
        <Card className='h-auto max-w-[600px] min-w-[310px] mx-auto p-0 mt-2'>
          <Button className="h-13  m-2 w-auto" onClick={handleClick}> Create a post</Button>
          <div className="p-0 m-0 h-8"></div>
        </Card>

        <div className='flex-2 max-w-[600px] min-w-[310px] mx-auto'>
          {
            activeCards?.map((card) => ( 
              <ShowCard 
                key = {card._id} 
                cardId = {card._id} 
                userId= {card?.user._id}
                image = {card.image?.url} 
                title = {card.title} 
                description = {card.description} 
                dot = { (session?.user.id == card?.user._id) } 
                userName= {card?.user.name}
                userProfile= {card?.user.picture}
              />
            )
          )} 
        </div>
      </div>


      <>
      {
        !hide && <Card className='h-[500px] max-w-[350px] m-2 flex-1 '>
        < CarouselDemo />
        </Card>
      }
      </>

    </div>

  );
}

export default Notification;
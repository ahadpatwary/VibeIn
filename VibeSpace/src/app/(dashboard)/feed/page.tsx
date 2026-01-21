'use client'

import { ShowCard } from '@/components/ShowCard';
import { CustomWrapper } from '@/components/CustomWrapper'
import { MenubarDemo } from '@/components/Bar';
import { useSession } from "next-auth/react"
import { useCards }  from '@/hooks/useFetchCards';
import { Card, CardContent } from "@/components/ui/card"
import { UserProfile } from '@/components/UserProfile';
import CarouselDemo from '@/components/Embla';
import { useEffect, useState} from 'react';

function Feed() {
  const { data: session } = useSession()

  const { activeCards } = useCards(session?.user.id!);
  const [hide, setHide] = useState(false);
  const [profileHide, setProfileHide] = useState(false);

useEffect(() => {
  const handleResize = () => {
    if (window.innerWidth < 1050) {
      setHide(true);
    } else {
      setHide(false);
    }

    if(window.innerWidth < 668){
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


  return (
    <div className="w-full h-dvh flex flex-col">
    
    <MenubarDemo />
    <div className='w-full flex justify-center'>
    <div className='flex max-w-[1600px] w-full ml-2 mr-2 w-auto justify-around'>
      <>
      {
        !profileHide &&       <Card className='h-[500px] max-w-[35%] flex-1 m-2'>
        <UserProfile dot={true}  userId = "" />
      </Card>
      }
      </>

      <div className='flex-2 max-w[700px] min-w-[400px]'>
              <CustomWrapper > 
        {
          activeCards?.map((card) => ( 
            <ShowCard 
              key = {card._id} 
              cardId = {card._id} 
              image = {card.image?.url} 
              title = {card.title} 
              description = {card.description} 
              dot = { (session?.user.id == card?.user._id) } 
              userName= {card?.user.name}
              userProfile= {card?.user.picture}
            />
          )
        )} 
      </CustomWrapper>
      </div>


      <>
      {
        !hide && <Card className='h-[500px] max-w-[350px] m-2 flex-1 '>
        < CarouselDemo />
        </Card>
      }
      </>

    </div>
    </div>

    </div>
  );
}

export default Feed;
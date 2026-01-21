'use client'

import { ShowCard } from '@/components/ShowCard';
import { CustomWrapper } from '@/components/CustomWrapper'
import { MenubarDemo } from '@/components/Bar';
import { useSession } from "next-auth/react"
import { useCards }  from '@/hooks/useFetchCards';
import { Card, CardContent } from "@/components/ui/card"
import { UserProfile } from '@/components/UserProfile';
import CarouselDemo from '@/components/Embla';

function Feed() {
  const { data: session } = useSession()

  const { activeCards } = useCards(session?.user.id!);

  return (
    <div className="w-full h-dvh flex flex-col">
    
    <MenubarDemo />
    <div className='w-full flex justify-center'>
    <div className='flex max-w-[1600px] w-full ml-2 mr-2 w-auto justify-around'>
      <Card className='h-[500px] max-w-[350px] flex-1 m-2'>
        <UserProfile dot={true}  userId = "" />
      </Card>

      <div className='flex-2 max-w[700px]'>
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
        window.innerWidth > 1000 && <Card className='h-[500px] max-w-[350px] m-2 flex-1 '>
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
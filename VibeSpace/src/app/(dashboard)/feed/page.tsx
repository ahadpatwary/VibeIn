'use client'

import { ShowCard } from '@/components/ShowCard';
import { CustomWrapper } from '@/components/CustomWrapper'
import { MenubarDemo } from '@/components/Bar';
import { useSession } from "next-auth/react"
import { useCards }  from '@/hooks/useFetchCards';

 function Feed() {
  const { data: session } = useSession()

  const { activeCards } = useCards(session?.user.id!);

  return (
    <div className="w-full h-dvh flex flex-col">
    
      <MenubarDemo />
     
      <CustomWrapper > 
        {
          activeCards.map((card) => ( 
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
  );
}

export default Feed;
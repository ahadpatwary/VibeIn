'use client'

import { ShowCard } from '@/components/ShowCard';
import { CustomWrapper } from '@/components/CustomWrapper'
import { MenubarDemo } from '@/components/Bar';
import { useSession, signIn, signOut } from "next-auth/react"
import { useCards }  from '@/hooks/useFetchCards';

function Home() {
  const { activeCards } = useCards();
  const { data: session } = useSession()
  return (
    <div className="w-full h-dvh flex flex-col">
    
      <MenubarDemo />
     
      <CustomWrapper > 
        {
          activeCards.map((card) => ( 
            <ShowCard 
              key = {card._id} 
              cardId = {card._id} 
              userId = {card.user}
              title = {card.title} 
              image = {card.image?.url} 
              description = {card.description} 
              dot = { (session?.user.id == card.user) } 
            />
          )
        )} 
      </CustomWrapper>

    </div>
  );
}

export default Home;
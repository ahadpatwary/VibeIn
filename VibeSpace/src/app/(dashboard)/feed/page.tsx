'use client'

import { ShowCard } from '@/components/ShowCard';
import { CustomWrapper } from '@/components/CustomWrapper'
import { MenubarDemo } from '@/components/Bar';
import { useCards }  from '@/hooks/useFetchCards';

function Home() {
  const {session ,activeCards} = useCards();
  return (
    <div className="w-full flex flex-col">
    
      <MenubarDemo />
      <div className="pt-14 md:pt-16">
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
              dot = { (session == card.user) } 
            />
          )
        )} 
      </CustomWrapper>
      </div>
    </div>
  );
}

export default Home;
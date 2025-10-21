'use client'

import { MenubarDemo } from '@/components/Bar';
import { ShowCard } from '@/components/ShowCard';
import { CustomWrapper } from '@/components/CustomWrapper'
import useFeed from '@/hooks/useFeed';

function SavePost() {
  const { data } = useFeed("savedCards");
  return (
    <>
      <MenubarDemo />
      <div className = "h-15 w-screen bg-transparent "> </div>
      <CustomWrapper>
        {
          data.map((card) => ( 
            <ShowCard 
              key={card._id} 
              cardId = {card._id}
              userId = {card.user}
              title={card.title}
              image={card.image?.url}
              description={card.description}
              dot ={false} 
            />
          )
        )}
      </CustomWrapper>
    </>
  );
}

export default SavePost;
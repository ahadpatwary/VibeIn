'use client'

import {ShowCard} from '@/components/ShowCard'
import useFeed from '@/hooks/useFeed';
import { ScrollArea } from '@/components/ui/scroll-area';


function Home() {

  const { data } = useFeed("cards");

  return (
    <ScrollArea className = "w-full">
        <div className=" h-dvh flex flex-wrap gap-4 justify-center">

            {data.map((card) => (
                
                <ShowCard
                    key={card._id}
                    cardId={card._id}
                    userId={card.user}
                    title={card.title}
                    image={card.image?.url}
                    description={card.description}
                    dot={true}
                />
            ))}
        </div>
    </ScrollArea>
  );
}

export default Home;
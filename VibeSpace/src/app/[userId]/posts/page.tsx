'use client'

import {ShowCard} from '@/components/ShowCard'
import useFeed from '@/hooks/useFeed';
import { ScrollArea } from '@/components/ui/scroll-area';


interface PostsPageProps {
  params: { userId: string }
}

function Home({ params }: PostsPageProps) {

  const { userId } = params;


  const { data } = useFeed("cards", false, userId);


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
                    dot={ userId === '' ? true : false }
                />
            ))}
        </div>
    </ScrollArea>
  );
}

export default Home;
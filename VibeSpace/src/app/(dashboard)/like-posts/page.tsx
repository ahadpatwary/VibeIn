'use client'
import { MenubarDemo } from '@/components/Bar'
import {ShowCard} from '@/components/ShowCard'
import { CustomWrapper } from '@/components/CustomWrapper'
import useFeed from '@/hooks/useFeed';

function Home() {
  const { data } = useFeed("likedCards");

  return (
    <div className="w-full flex flex-col">
      <MenubarDemo />

      <div className="pt-14 md:pt-16">
        <CustomWrapper>
          {data.map((card) => (
            <ShowCard
              key={card._id}
              cardId={card._id}
              userId={card.user}
              title={card.title}
              image={card.image?.url}
              description={card.description}
              dot={false}
            />
          ))}
        </CustomWrapper>
      </div>
    </div>
  );
}

export default Home;
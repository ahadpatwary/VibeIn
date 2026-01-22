'use client'

import { ShowCard } from '@/components/ShowCard';
import { CustomWrapper } from '@/components/CustomWrapper'
import { useSession } from "next-auth/react"
import { useCards }  from '@/hooks/useFetchCards';
import { Card } from "@/components/ui/card"
import { UserProfile } from '@/components/UserProfile';
import CarouselDemo from '@/components/Embla';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { MenubarDemo } from '@/components/Bar';
import { ScrollArea } from '@/components/ui/scroll-area'

function Requests() {
  const { data: session } = useSession()
  const { activeCards } = useCards(session?.user.id!);
  const router = useRouter();

  const handleClick = () => {
    router.push('/create-post');
  }

  return (

    <div className="flex flex-col min-h-dvh max-h-dvh">

      <MenubarDemo />
      <div className='flex-1 min-h-0 max-w-7xl w-full mx-auto px-4 flex justify-around'>

        <Card className='flex-1 min-w-0 w-full max-h-auto h-full mt-2 hidden md:block'>
          <UserProfile dot={true}  userId = "" />
        </Card>

        <ScrollArea className='flex-2 max-w-[600px] min-w-[310px] w-full flex flex-col overflow-y-auto'>
    
        <div className='md:mx-3'>
          <Card className=' max-w-[600px] min-w-[310px] w-full mx-auto p-0 mt-2'>
            <Button className="h-13  m-2 w-auto" onClick={handleClick}> Create a post</Button>
            <div className="p-0 m-0 h-8"></div>
          </Card>

          <div className='flex-1 max-w-[600px] w-full min-w-[310px] mx-auto'>
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
          </ScrollArea>

        <Card className='flex-1 min-h-auto h-min min-w-0 mt-2 hidden lg:block'>
          < CarouselDemo />
        </Card>

      </div>
      <footer className=' block md:hidden sticky bottom-0'>
        <MenubarDemo footer={true} />
      </footer>
    </div>

  );
}

export default Requests;
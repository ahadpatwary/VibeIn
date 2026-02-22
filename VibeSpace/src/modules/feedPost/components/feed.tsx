'use client'

// import { UserProfile } from '@/components/UserProfile';

import { useRouter } from 'next/navigation';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
// import { AvatarDemo } from '@/shared/components/AvaterDemo';
import { MenubarDemo } from '@/shared/components/Bar';
import { useSearchUser } from '@/shared/hooks/useSearchUser';
import { feedPostsType } from '../hooks/useCard';
import { useCard } from '../hooks/useCard';
import { ShowCard } from './ShowCard';
import CarouselDemo from '@/shared/components/Embla';





function Feed() {
  const { activePosts } = useCard();
  const router = useRouter();
  const { searchUser, handleSearchClick } = useSearchUser();

  const handleClick = () => {
    router.push('/create-post');
  }
  console.log("searchUserssss", searchUser);

  return (

    <div className="flex flex-col min-h-dvh max-h-dvh">

      <MenubarDemo onSearch={handleSearchClick} />
      <div className='flex-1 min-h-0 max-w-7xl w-full mx-auto px-4 flex justify-around'>

        <Card className='flex-1 min-w-0 w-full max-h-auto h-full mt-2 hidden md:block'>
          {/* <UserProfile dot={true}  userId = "" /> */}
        </Card>

        {/* <>

        {searchUser.length > 0 && (
          <div className=" absolute z-10000 top-10 max-h-[calc(100dvh-100px)] h-full max-w-[30%] min-w-[310px] w-full m-2 overflow-y-auto bg-black h-min rounded-lg p-2">
            {searchUser.map((user) => { 
              console.log("randerd");
              return(<div
                key={user.id}
                className="w-full h-[60px] text-white flex items-center px-2"
              >
                <div className='flex'>
                  <AvatarDemo src={user.picture} />
                  <p className='ml-2'>{user.name}</p>
                </div>
              </div>
             )})}
          </div>
        )}

        </> */}

        <ScrollArea className='flex-2 max-w-[600px] min-w-[310px] w-full flex flex-col overflow-y-auto'>

          <div className='md:mx-3'>
            <Card className=' max-w-[600px] min-w-[310px] w-full mx-auto p-0 mt-2'>
              <Button className="h-13  m-2 w-auto" onClick={handleClick}> Create a post</Button>
              <div className="p-0 m-0 h-8"></div>
            </Card>

            <div className='flex-1 max-w-[600px] w-full min-w-[310px] mx-auto'>
              {
                activePosts?.map((card: feedPostsType) => (
                  <ShowCard
                    key={card._id}
                    // cardId = {card._id} 
                    userId={card.authorId._id}
                    image={card.media[0].content.url}
                    title={card.title}
                    description={card?.caption}
                    //   dot = { (session?.user.id == card.authorId._id) }
                    dot={true}
                    userName={card.authorId.name}
                    userProfile={card.authorId.profilePicture}
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

export default Feed;
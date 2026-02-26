'use client'

// import { UserProfile } from '@/components/UserProfile';

import { useRouter } from 'next/navigation';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { MenubarDemo } from '@/shared/components/Bar';
import { useSearchUser } from '@/shared/hooks/useSearchUser';
import { feedPostsType } from '../hooks/useCard';
import { useCard } from '../hooks/useCard';
import { ShowCard } from './ShowCard';
import CarouselDemo from '@/shared/components/Embla';
import { UserProfile } from '@/shared/components/UserProfile';
import { AvatarDemo } from '@/shared/components/AvaterDemo';





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
      <div className='flex-1 min-h-0 max-w-7xl w-full mx-auto px-1 flex justify-around'>

        <Card className='flex-1 min-w-0 w-full max-h-auto h-full mt-2 hidden md:block'>
          <UserProfile dot={true} userId="" />
        </Card>

        <>
          {searchUser.length > 0 && (
            <Card className=" absolute z-10000 top-10 max-h-[calc(100dvh-100px)] h-full max-w-[30%] min-w-[310px] w-full m-2 overflow-y-auto h-min rounded-lg p-2">
              {searchUser.map((user) => {
                console.log("randerd");
                return (<div
                  key={user._id}
                  className="w-full h-[60px] text-white flex items-center px-2"
                >
                  <div className='flex gap-1'>
                    <AvatarDemo src={user.profilePicture.url ?? undefined} />
                    <p className='p-2'>{user.name}</p>
                  </div>
                </div>
                )
              })}
            </Card>
          )}
        </>

        <ScrollArea className='flex-2 max-w-[600px] min-w-[310px] w-full flex flex-col overflow-y-auto'>

          <div className='sm:mx-0 md:mx-3'>
            <div className=" border mt-2 border-gray-800 rounded-2xl p-5 shadow-sm">

              {/* Top Section */}
              <div className="flex items-center gap-4">
                <img
                  src="https://i.pravatar.cc/100"
                  alt="profile"
                  className="w-12 h-12 rounded-full object-cover"
                />

                <button className="flex-1 text-left bg-[#0f172a] hover:bg-[#1e293b] transition rounded-full px-5 py-3 text-sm text-gray-400 border border-gray-700">
                  What's on your mind?
                </button>
              </div>

              {/* Divider */}
              <div className="my-4 border-t border-gray-800" />

              {/* Bottom Actions */}
              <div className="flex items-center justify-between flex-wrap gap-3">

                <div className="flex items-center gap-6 text-sm text-gray-400">

                  <button className="flex items-center gap-2 hover:text-blue-400 transition">
                    📷 <span>Photo</span>
                  </button>

                  <button className="flex items-center gap-2 hover:text-green-400 transition">
                    🎥 <span>Video</span>
                  </button>

                  <button className="flex items-center gap-2 hover:text-purple-400 transition">
                    📄 <span>File</span>
                  </button>

                </div>

                <button className="px-5 py-2 text-sm font-medium rounded-full bg-blue-600 hover:bg-blue-500 transition">
                  Post
                </button>
              </div>

            </div>

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
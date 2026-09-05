'use client'

import { useRouter } from 'next/navigation';
import { MenubarDemo } from '@/shared/components/Bar';
import { useSearchUser } from '@/shared/hooks/useSearchUser';
import Main from './main';
import RightSide from './rightSide';
import LeftSide from './leftSide';
import SearchCard from './searchCard';






function Feed() {

  const { handleSearchClick } = useSearchUser();


  return (

    <div className="flex flex-col min-h-dvh max-h-dvh">

      <MenubarDemo onSearch={handleSearchClick} />
      <div className='flex-1 min-h-0 max-w-7xl w-full mx-auto px-1 flex justify-around'>

        <LeftSide />

        <SearchCard />


        <Main />

        <RightSide />

      </div>
      <footer className=' block md:hidden sticky bottom-0'>
        <MenubarDemo footer={true} />
      </footer>
    </div>

  );
}

export default Feed;
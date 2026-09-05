import { AvatarDemo } from "@/shared/components/AvaterDemo";
import { Card } from "@/shared/components/ui/card";
import { useSearchUser } from "@/shared/hooks/useSearchUser";


function SearchCard() {
    
  const { searchUser } = useSearchUser();

  return (
    <>
        {searchUser.length > 0 && (
        <Card className="absolute z-10000 top-10 max-h-[calc(100dvh-100px)] max-w-[30%] min-w-[310px] w-full m-2 overflow-y-auto h-min rounded-lg p-2">
            {searchUser.map((user) => {
            console.log("randerd");
            return (<div
                key={user._id}
                className="w-full h-[60px] text-foreground flex items-center px-2 hover:bg-muted rounded transition-colors"
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
  )
}

export default SearchCard
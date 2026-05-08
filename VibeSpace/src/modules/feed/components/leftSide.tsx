import { Card } from '@/shared/components/ui/card'
import { UserProfile } from '@/shared/components/UserProfile'

function LeftSide() {
  return (
        <Card className='flex-1 min-w-0 w-full max-h-auto h-full mt-2 hidden md:block'>
          <UserProfile dot={true} userId="" />
        </Card>
  )
}

export default LeftSide
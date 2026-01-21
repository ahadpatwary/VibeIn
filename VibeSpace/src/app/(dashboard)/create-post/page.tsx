import { MenubarDemo } from '@/components/Bar';
import CreatePost from '@/components/CreatePost';

function upload(){
    return(
        <div className='w-full flex flex-col'>
             <div className="flex flex-1 justify-center items-center h-screen w-screen">
                <CreatePost disabled = {false} />
             </div>
        </div>
    )
}
export default upload;
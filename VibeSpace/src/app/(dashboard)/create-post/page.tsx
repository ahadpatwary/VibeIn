import { MenubarDemo } from '@/components/Bar';
import CreatePost from '@/components/CreatePost';

function upload(){
    return(
        <>
            <MenubarDemo />
             <div className="flex justify-center items-center h-screen w-screen">
                <CreatePost disabled = {false} />
             </div>
        </>
    )
}
export default upload;
//createPost
//editPost
//getPost
//deletePost


export const useFeedPost = () => {
    
    const createPost = async () => {

        const res = await createPostApi();

    }

    const editPost = async () => {
        
        const res = await editPostApi();
    }

    const getPost = async () => {

        const res = await getPostApi();
    }

    const deletePost = async () => {

        const res = await deletePostApi();
    }
}
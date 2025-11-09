import { AvatarDemo } from "./AvaterDemo"

interface propType{
    key: string,
    name: string,
    picture: string,
    number: number,
    message: string,
    // fun: () => void
}

export const ChatModel = (
    {
        key,
        name,
        picture,
        number,
        message,
        // func
    }: propType
) => {
    return(
        <button
            key={key}
            className="w-full mb-2 bg-zinc-700 rounded hover:bg-zinc-700 transition"
            // onClick={() => handleClick()}
        >
            <div className="flex w-full p-2">
            <AvatarDemo 
                src={ picture }
                size="size-15" />

            <div className="flex w-[10px] flex-col flex-1 min-w-0 px-2">
                <div className="flex justify-between items-center w-full">
                <h2 className="text-lg font-semibold text-gray-200 truncate">
                    {name}
                    </h2>
                <p className="text-sm text-gray-400 ml-auto">
                    {number}
                </p>
                </div>
                <p className="text-gray-900 text-sm truncate">{message}</p>
            </div>
            </div>
        </button>
    );
}
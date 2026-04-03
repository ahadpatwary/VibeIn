
function AiChat({setAi}: {setAi: React.Dispatch<React.SetStateAction<boolean>>}) {
  return (
    <div className='w-full md:border-1 min-h-dvh p-2 flex flex-col text-white'>
      <div className='h-[40px] border-b flex'>
        <button className="mr-2 pointer rounded-full border-4" onClick={() => {
            setAi((prev) => !prev)
        }}>{`<-`}</button>
        <h1 className="">Create A Post Using AI</h1>
      </div>
      <div className='flex-1 border-b'>

      </div>
      <div className="h-[100px]">
        <input name="" id="" className="outline-none border-2 p-2 rounded-4xl w-full mt-2"></input>
      </div>
    </div>
  )
}

export default AiChat
interface propType{
  replyText: string,
}

export function ReplyMessage({ replyText }: propType) {

  return (
    <div className=" border w-full rounded-md bg-gray-100 mt-1">
      
      <h4 className="font-semibold text-sm">{replyText}</h4>
      {/* <p className="text-xs text-gray-500">{orginalText}</p> */}
    </div>
  );
}
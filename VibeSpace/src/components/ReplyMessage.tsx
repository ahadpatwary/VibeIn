// LinkPreview.jsx
// import { useLinkPreview } from '@/hooks/useLinkPreview';

export function ReplyMessage({ replyText }) {
//   const  data = useLinkPreview(url) || {
//     ogTitle: "comming data",
//     ogDescription: "comming description"
//   }

  // if (isLoading) return <div>Loading preview...</div>;
  // if (!data?.ogTitle) return null;

  return (
    <div className="p-2 border rounded-md bg-gray-100 mt-1">
      {}
      <h4 className="font-semibold text-sm">{replyText}</h4>
      {/* <p className="text-xs text-gray-500">{orginalText}</p> */}
    </div>
  );
}
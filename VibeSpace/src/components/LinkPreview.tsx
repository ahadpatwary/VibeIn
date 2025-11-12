// LinkPreview.jsx
import { useLinkPreview } from '@/hooks/useLinkPreview';

export function LinkPreview({ url }) {
  const  data = useLinkPreview(url) || {
    ogTitle: "comming data",
    ogDescription: "comming description"
  }

  // if (isLoading) return <div>Loading preview...</div>;
  // if (!data?.ogTitle) return null;

  return (
    <div className="p-2 border rounded-md bg-gray-100 mt-1">
      {data.ogImage?.length >= 0 && <img src={data?.ogImage[0]?.url} alt="preview" className="rounded-md mb-1 object-cover" />}
      <h4 className="font-semibold text-sm">{data.ogTitle}</h4>
      <p className="text-xs text-gray-500">{data.ogDescription}</p>
    </div>
  );
}
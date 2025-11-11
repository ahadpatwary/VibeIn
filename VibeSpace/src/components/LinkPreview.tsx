// LinkPreview.jsx
import { useLinkPreview } from '@/hooks/useLinkPreview';

export function LinkPreview({ url }) {
  const { data, isLoading } = useLinkPreview(url);

  if (isLoading) return <div>Loading preview...</div>;
  if (!data?.ogTitle) return null;

  return (
    <div className="p-2 border rounded-md bg-gray-100 mt-1">
      <img src={data.ogImage?.url} alt="preview" className="rounded-md mb-1 w-full h-40 object-cover" />
      <h4 className="font-semibold text-sm">{data.ogTitle}</h4>
      <p className="text-xs text-gray-500">{data.ogDescription}</p>
    </div>
  );
}
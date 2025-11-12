// LinkPreview.tsx
import { useLinkPreview } from '@/hooks/useLinkPreview';

interface PropType {
  url: string;
}

export function LinkPreview({ url }: PropType) {
  const data =
    useLinkPreview(url) || {
      ogTitle: "coming data",
      ogDescription: "coming description",
      ogImage: [{ url }],
    };

  return (
    <div className="p-2 w-full border rounded-md bg-gray-100 mt-1">
      {data.ogImage?.length > 0 && (
        <img
          src={data.ogImage[0].url}
          alt="preview"
          className="rounded-md mb-1 object-cover"
        />
      )}
      <h4 className="font-semibold text-sm">{data.ogTitle}</h4>
      <p className="text-xs text-gray-500">{data.ogDescription}</p>
    </div>
  );
}
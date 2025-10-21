'use client'
import { useParams } from 'next/navigation';
import { ResizableDemo } from '@/components/ResizableDemo'
import useFeed from '@/hooks/useFeed';

export default function BlogPage() {
  const params = useParams();
  const userId = params?.userId as string;

  const { data } = useFeed('cards', false, userId); 

  return (
    <>
      <ResizableDemo post={data} userId={userId} Dot={false} />
    </>
  )
}
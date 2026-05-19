import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { ShowCard } from '@/modules/productCard/components/ShowCard';
import { productType } from '@/modules/productCard/schemas/productCard';
import { useRouter } from 'next/navigation';
import { useProductCards } from '@/modules/productCard/hooks/productCards';


function Main() {
    const router = useRouter();
    const { productCards } = useProductCards();

    const handleClick = () => {
        router.push('/create_post');
    }

  return (
    <ScrollArea className='flex-2 max-w-[600px] min-w-[310px] w-full flex flex-col overflow-y-auto'>

        <div className='sm:mx-0 md:mx-3'>
            <div className="border mt-2 rounded-2xl p-5 shadow-sm border-border bg-card">

              {/* Top Section */}
              <div className="flex items-center gap-4">
                <img
                  src="https://i.pravatar.cc/100"
                  alt="profile"
                  className="w-12 h-12 rounded-full object-cover"
                />

                <button 
                  className="flex-1 text-left bg-background hover:bg-muted transition rounded-full px-5 py-3 text-sm text-muted-foreground border border-border"
                  onClick={handleClick}
                >
                  What's on your mind?
                </button>
              </div>

              {/* Divider */}
              <div className="my-4 border-t border-border" />

              {/* Bottom Actions */}
              <div className="flex items-center justify-between flex-wrap gap-3">

                <div className="flex items-center gap-6 text-sm text-muted-foreground">

                  <button className="flex items-center gap-2 hover:text-primary transition">
                    📷 <span>Photo</span>
                  </button>

                  <button className="flex items-center gap-2 hover:text-primary transition">
                    🎥 <span>Video</span>
                  </button>

                  <button className="flex items-center gap-2 hover:text-primary transition">
                    📄 <span>File</span>
                  </button>

                </div>

                <button className="px-5 py-2 text-sm font-medium rounded-full bg-primary text-primary-foreground hover:opacity-90 transition">
                  Post
                </button>
              </div>

            </div>

            <div className='flex-1 max-w-[600px] w-full min-w-[310px] mx-auto'>
              {
                productCards?.map((card: productType) => (
                  <ShowCard
                    key={card.title}
                    title={card.title}
                    description={card.description}
                    sellerName={card.sellerName}
                    sellerAvatar={card?.sellerAvatar ?? undefined }
                    price={card.price}
                    currency={card.currency}
                    rating={card.rating}
                    reviewCount={card.reviewCount}
                    salesCount={card.salesCount}
                    viewCount={card.viewCount}
                    techStack={card.techStack}
                    licenseType={card.licenseType}
                    isPrivate={card.isPrivate}
                    isFeatured={card.isFeatured}
                    isVerified={card.isVerified}
                    previewUrl={card.previewUrl}
                    productUrl={card.productUrl}
                    media={card.media}
                    postedAt={card.postedAt}
                  />
                )
                )}

            </div>

          </div>
        </ScrollArea>
  )
}

export default Main
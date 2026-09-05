import * as React from "react"
import { Card, CardContent } from "@/shared/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/components/ui/carousel"

export default function CarouselDemo() {
  return (
    <div className="w-full flex justify-center">
      <Carousel className="w-[85%] sm:max-w-xs">
        <CarouselContent>
          {Array.from({ length: 10 }).map((_, index) => (
            <CarouselItem key={index}>
              <div className="p-1">
                <Card className="shadow-lg bg-neutral-700">
                  <CardContent className="flex aspect-square items-center justify-center p-2 rounded-2 ">
                    {/* <span className="text-4xl font-semibold">Founder Ahad</span> */}
                    <img src="http://res.cloudinary.com/dnyr37sgw/image/upload/v1771784366/production_assets/profiles/img_1771784196418_599.jpg" alt="" className="w-full h-full" />
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="w-full flex justify-around m-3">
          <CarouselPrevious />
          <CarouselNext />

        </div>

      </Carousel>
    </div>

  )
}

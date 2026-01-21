import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

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
                  <img src="https://res.cloudinary.com/dnyr37sgw/image/upload/v1768349203/user_pictures/hymo6s7tvyjakmk58drs.png" alt="" className="w-full h-full"/>
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

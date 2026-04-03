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
    <div className="min-h-dvh max-h-dvh min-w-[320px] max-w-7xl m-auto">
      <Carousel className="">
        <CarouselContent className="">
          {Array.from({ length: 10 }).map((_, index) => (
            <CarouselItem key={index}>
              <div className="">
                  <CardContent className="flex items-center justify-center rounded-2 h-dvh">
                    <p className="text-white">ahad</p>
                  </CardContent>
              </div>
                <div className="absolute bottom-1 m-auto w-full flex justify-center gap-4">
                    <CarouselPrevious />
                    <CarouselNext />
                </div>
            </CarouselItem>
          ))}
        </CarouselContent>


      </Carousel>
    </div>

  )
}
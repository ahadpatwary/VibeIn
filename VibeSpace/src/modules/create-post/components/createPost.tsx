'use client'
import { CustomInput } from '@/shared/components/Input'
// import { Card } from '@/shared/components/ui/card'
import { useState } from 'react'
import * as React from "react"
import { Card, CardContent } from "@/shared/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/components/ui/carousel"
import { CreatePostUsingAi } from './createPostUsingAi'
import CreatePostManually from './createPostManually'
import AiChat from './aiChat'

function CreatePost() {

    const [ai, setAi] = useState(false)
    return (
        <div className='min-w-[310px] lg:max-w-7xl w-full min-h-dvh lg:m-auto'>
            {/* desktop */}
            <div className='hidden md:flex'>
                <div className='w-full'>
                    {
                        ai ? <AiChat setAi={setAi}/> :  <CreatePostUsingAi setAi={setAi} />
                    }
                </div>
                <div className=' md:min-w-sm lg:min-w-md '>
                    <CreatePostManually />
                </div>
            </div>
            {/* mobile */}
            <div className='md:hidden'>
                       <Carousel className="">
         <CarouselContent className="">

                       <CarouselItem>
               <CardContent>
                    {
                        ai ? <AiChat setAi={setAi}/> :  <CreatePostUsingAi setAi={setAi} />
                    }
                </CardContent>
                                <div className="absolute bottom-1 m-auto w-full flex justify-center gap-4">
                    <CarouselPrevious />
                    <CarouselNext />
                </div>
            </CarouselItem>

            <CarouselItem>
                <CardContent className="flex items-center justify-center rounded-2 h-dvh p-1">

                    <CreatePostManually />                      
        
                </CardContent>
              
                <div className="absolute bottom-1 m-auto w-full flex justify-center gap-4">
                    <CarouselPrevious />
                    <CarouselNext />
                </div>
            </CarouselItem>

          
        </CarouselContent>


      </Carousel>
            </div>
        </div>
    )

}

export default CreatePost
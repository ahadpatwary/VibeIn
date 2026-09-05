import Content from "@/modules/connection/components/content"
import LeftSide from "@/modules/connection/components/leftSide"
import RightSide from "@/modules/connection/components/rightSide"
import { MenubarDemo } from "@/shared/components/Bar"

function Page() {
    return (
        <div className="max-h-dvh w-full min-h-dvh flex flex-col items-center">

            <MenubarDemo />

            <div className="flex flex-1 min-h-0 mt-2 border-t border-gray-800 max-w-[1280px] w-full">
                {/* LEFT SIDEBAR */}
                <LeftSide className="" />
                <Content className="hidden md:block" />
                <RightSide className="hidden lg:block min-h-0" />


                {/* CENTER SECTION */}


                {/* RIGHT PANEL */}


            </div>
        </div>
    )
}

export default Page
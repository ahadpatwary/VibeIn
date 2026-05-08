import {
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import Link from "next/link"    


interface propsType {
    title: string,
    description: string,
    goRouter?: string,
    backRouter?: string,
    backText?: unknown
    goText?: unknown
}

export const Header = ({title, description, backRouter, goRouter, backText, goText}: propsType) => {
    return (
        <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription >
             {description}
            </CardDescription>
            <CardAction>
                {
                    backRouter && (
                        <Link 
                            href={backRouter}
                            className="ml-auto inline-block text-sm underline-offset-4 hover:underline m-1"
                        >
                            {backText as string}
                        </Link>
                    )
                }

                {
                    goRouter && (

                        <Link 
                            href={goRouter}
                            className="ml-auto inline-block text-sm underline-offset-4 hover:underline m-1"
                        >
                            {goText as string}
                        </Link>
                    )
                }
            </CardAction>
        </CardHeader>
    )
}
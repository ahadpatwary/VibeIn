import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import Link from "next/link"    

interface propsType {
    title: string,
    description: string,
    router: string,
    text: string,
}

export const Header = ({title, description, router, text}: propsType) => {
    return (
        <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription >
             {description}
            </CardDescription>
            <CardAction>
            <Link 
                href={title}
                className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
            >
                {text}
            </Link>
            </CardAction>
        </CardHeader>
    )
}
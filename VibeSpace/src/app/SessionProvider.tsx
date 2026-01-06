import { SessionProvider } from "next-auth/react"

export default function SessionProvider({
  children
} : {
  children: React.ReactNode
}) {
  return (
    <SessionProvider session={session}>
      { children }
    </SessionProvider>
  )
}
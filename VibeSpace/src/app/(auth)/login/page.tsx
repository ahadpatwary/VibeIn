import { Login } from "@/modules/auth/frontend/components/login";

export default function Home() {

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-lg flex-col gap-6">
        <Login />
      </div>
    </div>
  )
}
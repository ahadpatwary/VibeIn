'use client'
import { Button } from "@/shared/components/ui/button";
import homePageCardData from './../data/HomePageCardData.json'
import { Card } from "@/shared/components/ui/card";
import { useRouter } from "next/navigation";

export default async function Page() {
  const router = useRouter();

  return(
    <div className="min-h-dvh w-full flex flex-col bg-[#1F1F22] text-gray-200 overflow-y-auto">

      {/* NAVBAR */}
      <nav className="w-full flex justify-between items-center px-6 py-4 bg-[#242427] border-b border-white/10">
        <p className="text-3xl font-semibold text-blue-400">VibeIn</p>

        <div className="flex items-center gap-6 text-sm text-gray-300">
          <span className="cursor-pointer hover:text-white hidden sm:block">Home</span>
          <span className="cursor-pointer hover:text-white hidden sm:block">About</span>
          <span className="cursor-pointer hover:text-white hidden sm:block">Support</span>
          <Button 
            className="" 
            onClick={() => { router.push('/login')}}
          >
            Login
          </Button>
        </div>
      </nav>

      {/* MAIN */}
      <main className="flex-1 max-w-[1240px] w-full mx-auto px-4">

        {/* HERO SECTION */}
        <section className="flex flex-col-reverse md:flex-row items-center justify-between gap-10 py-20">
          
          <div className="max-w-xl text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              The Community <br/>
              <span className="text-blue-400">Built for Coders</span>
            </h1>

            <p className="mt-4 text-gray-400">
              Connect. Learn. Grow. <br/>
              with developers worldwide.
            </p>

            <Button 
              className="mt-6 px-6 py-3 text-lg shadow-lg"
              onClick={() => { router.push('/register')} }
            >
              Join VibeIn Today
            </Button>
          </div>

          {/* Laptop Placeholder */}
          <img src='./laptop.png' className="min-w-[310px] max-w-[500px] w-full bg-gradient-to-br from-blue-500/20 to-blue-700/20 rounded-xl m-2"/>
        </section>


        {/* TAGLINE */}
        <p className="text-center text-2xl md:text-3xl font-semibold my-16">
          Empowering <span className="text-blue-400">Coders</span> to Succeed!
        </p>

        {/* FEATURE CARDS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {
            homePageCardData.map((data) => (
              <Card
                key={data.id}
                className="border border-white/10 rounded-xl p-6 hover:border-blue-500 transition"
              >
                <p className="text-lg font-semibold text-blue-400 mb-2">
                  {data.title}
                </p>
                <p className="text-sm text-gray-400">
                  {data.description}
                </p>
              </Card>
            ))
          }
        </section>

        {/* CTA SECTION */}
        <section className="flex flex-col items-center text-center my-24 gap-4">
          <h2 className="text-3xl font-bold">
            Start Coding with <span className="text-blue-400">VibeIn</span> Today!
          </h2>

          <ul className="text-gray-400 space-y-2">
            <li>✔ Build your network within the coding community</li>
            <li>✔ Find your dream job in tech</li>
            <li>✔ Stay up-to-date with latest tutorials</li>
          </ul>

          <Button 
            className="mt-6 px-8 py-3 text-lg"
            onClick={() => { router.push('/register')} }
          >
            Join VibeIn
          </Button>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-[#242427] border-t border-white/10 py-10 text-sm text-gray-400">
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-4">
            <span>Home</span>
            <span>About</span>
            <span>Careers</span>
            <span>Support</span>
          </div>

          <p>Follow Us</p>

          <p>© VibeIn 2024. The professional community for coders.</p>

          <div className="flex gap-4">
            <span>Terms</span>
            <span>Privacy</span>
            <span>Security</span>
          </div>
        </div>
      </footer>

    </div>
  )
}
import Nav from './nav'
import Main from './main'
import Footer from './footer'

function Home() {
  return (
    <div className="min-h-dvh w-full flex flex-col bg-[#1F1F22] text-gray-200">
        <Nav />
        <Main />
        <Footer />
    </div>
  )
}

export default Home
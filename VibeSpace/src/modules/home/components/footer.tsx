
function Footer() {
  return (
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
  )
}

export default Footer

function Footer() {
  return (
    <footer className="bg-card border-t border-border py-10 text-sm text-muted-foreground">
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-4 text-foreground">
            <span className="hover:text-primary cursor-pointer transition">Home</span>
            <span className="hover:text-primary cursor-pointer transition">About</span>
            <span className="hover:text-primary cursor-pointer transition">Careers</span>
            <span className="hover:text-primary cursor-pointer transition">Support</span>
          </div>

          <p className="text-foreground font-semibold">Follow Us</p>

          <p className="text-muted-foreground">© VibeIn 2024. The professional community for coders.</p>

          <div className="flex gap-4 text-foreground">
            <span className="hover:text-primary cursor-pointer transition">Terms</span>
            <span className="hover:text-primary cursor-pointer transition">Privacy</span>
            <span className="hover:text-primary cursor-pointer transition">Security</span>
          </div>
        </div>
      </footer>
  )
}

export default Footer
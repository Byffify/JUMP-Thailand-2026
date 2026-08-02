import logo from "../assets/logo.png";

function Navbar() {
  return (
    <header className="bg-krumate-navy py-4 text-white">
      <nav className="max-w-6xl mx-auto justify-between items-center flex">
        <div>
          <img src={logo} alt="Logo" className="h-10 cursor-pointer" />
        </div>
        <div className="flex gap-4">
          <a
            href="/ideas"
            className="text-slate-400 hover:bg-white/5 hover:text-slate-200 text-sm font-medium transition-colors duration-300 px-4 py-2 rounded-full"
          >
            Ideas
          </a>
          <a
            href="/Library"
            className="text-slate-400 hover:bg-white/5 hover:text-slate-200 text-sm font-medium transition-colors duration-300 px-4 py-2 rounded-full"
          >
            My Materials
          </a>
        </div>
        <div>
          <button className="rounded-xl py-2 px-4 bg-krumate-teal hover:brightness-110 transition-colors duration-300 font-semibold cursor-pointer">
            @example666
          </button>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;

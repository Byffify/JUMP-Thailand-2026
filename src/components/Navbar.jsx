import logo from "../assets/logo.png";

function Navbar() {
  return (
    <header className="bg-krumate-navy py-4 text-white">
      <nav className="max-w-5xl mx-auto justify-between items-center flex">
        <div>
          <img src={logo} alt="Logo" className="h-10" />
        </div>
        <div className="flex gap-4 font-bold">
          <a
            href="/ideas"
            className="hover:text-blue-200 transition-colors duration-300"
          >
            Ideas
          </a>
          <a
            href="/discover"
            className="hover:text-blue-200 transition-colors duration-300"
          >
            Discover
          </a>
        </div>
        <div>
          <button className="rounded-xl p-2 bg-transparent border-2 border-white hover:bg-blue-700/50 transition-colors duration-300 font-semibold">
            @example666
          </button>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;

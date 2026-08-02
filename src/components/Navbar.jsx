import logo from "../assets/logo.png";
import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <header className="bg-krumate-navy py-4 text-white">
      <nav className="max-w-6xl mx-auto justify-between items-center flex">
        <div>
          <img src={logo} alt="Logo" className="h-10 cursor-pointer" />
        </div>
        <div className="flex gap-4">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? "text-slate-200 bg-white/5 text-sm font-medium transition-colors duration-300 px-4 py-2 rounded-full"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-200 text-sm font-medium transition-colors duration-300 px-4 py-2 rounded-full"
            }
          >
            แดชบอร์ด
          </NavLink>
          <NavLink
            to="/generator"
            className={({ isActive }) =>
              isActive
                ? "text-slate-200 bg-white/5 text-sm font-medium transition-colors duration-300 px-4 py-2 rounded-full"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-200 text-sm font-medium transition-colors duration-300 px-4 py-2 rounded-full"
            }
          >
            สร้างสื่อการสอน
          </NavLink>
          <NavLink
            to="/library"
            className={({ isActive }) =>
              isActive
                ? "text-slate-200 bg-white/5 text-sm font-medium transition-colors duration-300 px-4 py-2 rounded-full"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-200 text-sm font-medium transition-colors duration-300 px-4 py-2 rounded-full"
            }
          >
            คลังสื่อการสอน
          </NavLink>
          <NavLink
            to="/assistant"
            className={({ isActive }) =>
              isActive
                ? "text-slate-200 bg-white/5 text-sm font-medium transition-colors duration-300 px-4 py-2 rounded-full"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-200 text-sm font-medium transition-colors duration-300 px-4 py-2 rounded-full"
            }
          >
            ผู้ช่วย AI
          </NavLink>
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

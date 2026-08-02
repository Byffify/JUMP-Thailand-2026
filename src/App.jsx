import { useState } from "react";
import "./App.css";

import Hero from "./components/Hero.jsx";
import Navbar from "./components/Navbar.jsx";


function App() {
  return (
    <div>
      <Navbar />
      <Hero />
    </div>
  );
}

export default App;

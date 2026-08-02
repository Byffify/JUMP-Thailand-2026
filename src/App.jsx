import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
// import Generator from "./pages/Generator.jsx";
// import ContentPage from "./pages/ContentPage.jsx";
// import Library from "./pages/Library.jsx";
// import Assistant from "./pages/Assistant.jsx";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        {/* <Route path="/generator" element={<Generator />} />
        <Route path="/content/:id" element={<ContentPage />} />
        <Route path="/library" element={<Library />} />
        <Route path="/assistant" element={<Assistant />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;

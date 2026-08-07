import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/TopNav.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import Generator from "./pages/Generator.jsx";
import ContentPage from "./pages/ContentPage.jsx";
import Library from "./pages/Library.jsx";
import Assistant from "./pages/Assistant.jsx";
import { AppProvider } from "./context/AppContext.jsx";
import "./App.css";

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="generator" element={<Generator />} />
            <Route path="content/:id" element={<ContentPage />} />
            <Route path="library" element={<Library />} />
            <Route path="assistant" element={<Assistant />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
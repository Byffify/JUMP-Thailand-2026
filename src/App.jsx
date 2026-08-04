import { BrowserRouter, Routes, Route } from "react-router-dom";
// 1. เปลี่ยนจาก Navbar เป็น AppLayout (หรือ path ที่คุณเซฟไฟล์ไว้)
import AppLayout from "./components/Sidebar.jsx";

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
          {/* 2. นำ AppLayout มาเป็น Parent Route ครอบไว้ */}
          <Route path="/" element={<AppLayout />}>
            {/* 3. หน้าลูกเหล่านี้จะถูกส่งไปแสดงตรง <Outlet /> ใน AppLayout */}
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

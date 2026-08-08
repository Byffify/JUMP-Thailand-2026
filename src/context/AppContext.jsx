import { createContext, useContext, useState } from "react";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [prefillPrompt, setPrefillPrompt] = useState("");

  const value = {
    prefillPrompt,
    setPrefillPrompt,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp ต้องถูกเรียกภายใน <AppProvider>");
  }
  return ctx;
}
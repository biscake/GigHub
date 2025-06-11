import { useContext } from "react";
import { E2EEContext } from "../context/e2eeContext";

export const useE2EE = () => {
  const context = useContext(E2EEContext);

  if (!context) throw new Error("useE2EE must be used within an E2EEProvider");
  
  return context;
}
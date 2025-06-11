import { createContext } from "react";
import type { E2EEContextType } from "../types/e2ee";

export const E2EEContext = createContext<E2EEContextType | undefined>(undefined);

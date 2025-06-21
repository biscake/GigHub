import { createContext } from "react";
import type { E2EEContextType } from "../types/context";

export const E2EEContext = createContext<E2EEContextType | undefined>(undefined);

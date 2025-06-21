import { createContext } from "react";
import type { MessageCacheContextType } from "../types/context";

export const MessageCacheContext = createContext<MessageCacheContextType | undefined>(undefined);

import { createContext, useContext, useState, ReactNode } from "react";

export type PostulacionStatus = "pending" | "approved" | "rejected";

export type Postulacion = {
  id: string;
  runner: string;
  email: string;
  game: string;
  category: string;
  platform: string;
  estimatedTime: string;
  aspectRatio: string;
  videoUrl: string;
  status: PostulacionStatus;
  date: string;
  socialNetworks?: { type: string; url: string }[];
  notes?: string;
};

type AppContextType = {
  postulaciones: Postulacion[];
  addPostulacion: (postulacion: Omit<Postulacion, "id" | "status" | "date">) => void;
  updatePostulacionStatus: (id: string, status: PostulacionStatus) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);

  const addPostulacion = (postulacion: Omit<Postulacion, "id" | "status" | "date">) => {
    const newPostulacion: Postulacion = {
      ...postulacion,
      id: crypto.randomUUID(),
      status: "pending",
      date: new Date().toISOString().split("T")[0],
    };
    setPostulaciones((prev) => [newPostulacion, ...prev]);
  };

  const updatePostulacionStatus = (id: string, status: PostulacionStatus) => {
    setPostulaciones((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p))
    );
  };

  return (
    <AppContext.Provider
      value={{ postulaciones, addPostulacion, updatePostulacionStatus }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

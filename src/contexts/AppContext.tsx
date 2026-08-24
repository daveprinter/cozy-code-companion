import React, { createContext, useContext, useState, useEffect } from "react";

interface AppContextType {
  apartmentName: string;
  setApartmentName: (name: string) => void;
  caretakerCodes: string[];
  landlordCodes: string[];
  managementCode: string;
  addCaretakerCode: (code: string) => void;
  addLandlordCode: (code: string) => void;
  notifications: Notification[];
  addNotification: (n: Omit<Notification, "id" | "date" | "read">) => void;
  markNotificationRead: (id: string) => void;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apartmentName, setApartmentName] = useState(() =>
    localStorage.getItem("nyumba_apartment_name") || "Amani Apartments"
  );
  const [caretakerCodes, setCaretakerCodes] = useState<string[]>(() => {
    const saved = localStorage.getItem("nyumba_caretaker_codes");
    return saved ? JSON.parse(saved) : ["344577"];
  });
  const [landlordCodes, setLandlordCodes] = useState<string[]>(() => {
    const saved = localStorage.getItem("nyumba_landlord_codes");
    return saved ? JSON.parse(saved) : ["6747"];
  });
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem("nyumba_notifications");
    return saved ? JSON.parse(saved) : [];
  });

  const managementCode = "0404";

  useEffect(() => { localStorage.setItem("nyumba_apartment_name", apartmentName); }, [apartmentName]);
  useEffect(() => { localStorage.setItem("nyumba_caretaker_codes", JSON.stringify(caretakerCodes)); }, [caretakerCodes]);
  useEffect(() => { localStorage.setItem("nyumba_landlord_codes", JSON.stringify(landlordCodes)); }, [landlordCodes]);
  useEffect(() => { localStorage.setItem("nyumba_notifications", JSON.stringify(notifications)); }, [notifications]);

  const addCaretakerCode = (code: string) => {
    if (!caretakerCodes.includes(code)) setCaretakerCodes(prev => [...prev, code]);
  };
  const addLandlordCode = (code: string) => {
    if (!landlordCodes.includes(code)) setLandlordCodes(prev => [...prev, code]);
  };
  const addNotification = (n: Omit<Notification, "id" | "date" | "read">) => {
    setNotifications(prev => [{
      ...n, id: crypto.randomUUID(), date: new Date().toISOString(), read: false
    }, ...prev]);
  };
  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <AppContext.Provider value={{
      apartmentName, setApartmentName,
      caretakerCodes, landlordCodes, managementCode,
      addCaretakerCode, addLandlordCode,
      notifications, addNotification, markNotificationRead,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};

import { createContext, useContext, useState } from "react";

const UIContext = createContext();

export const UIProvider = ({ children }) => {

  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState(null);

  // ✅ Toast (NO CHANGE)
  const showToast = (message, type = "info") => {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // ✅ Confirm Modal (UPDATED 🔥)
  const showConfirm = ({ title, message, onConfirm }) => {
    setConfirm({
      title,
      message,

      onConfirm: async () => {
        // ✅ STEP 1: modal close instantly
        setConfirm(null);

        // ✅ STEP 2: run original logic safely
        try {
          await onConfirm?.();
        } catch (err) {
          console.log("Confirm error:", err);
        }
      },
    });
  };

  return (
    <UIContext.Provider
      value={{
        toast,
        confirm,
        setToast,
        setConfirm,
        showToast,
        showConfirm
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

// ✅ hook
export const useUI = () => useContext(UIContext);
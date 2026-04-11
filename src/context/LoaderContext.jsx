import { createContext, useContext, useState, useRef } from "react";

const LoaderContext = createContext();

export const LoaderProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const requestCount = useRef(0);

  const startLoading = () => {
    requestCount.current += 1;
    setLoading(true);
  };

  const stopLoading = () => {
    requestCount.current -= 1;

    if (requestCount.current <= 0) {
      requestCount.current = 0;
      setLoading(false); // 🔥 instant stop (no delay)
    }
  };

  return (
    <LoaderContext.Provider value={{ loading, startLoading, stopLoading }}>
      {children}
    </LoaderContext.Provider>
  );
};

export const useLoader = () => useContext(LoaderContext);
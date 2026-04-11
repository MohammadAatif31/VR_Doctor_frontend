import { useEffect } from "react";

export default function Toast({ message, type = "success", onClose }) {

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-999
      px-6 py-3 rounded-xl shadow-xl text-white font-sm
      ${type === "success" ? "bg-green-600" : ""}
      ${type === "error" ? "bg-red-600" : ""}
      ${type === "info" ? "bg-blue-600" : ""}
    `}>
      {message}
    </div>
  );
}
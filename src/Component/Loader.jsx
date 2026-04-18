import { useLoader } from "../context/LoaderContext";

function Loader() {
  const { loading } = useLoader();

  // 🔥 IMPORTANT — hide when not loading
  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-white text-sm"></p>
      </div>
    </div>
  );
}

export default Loader;
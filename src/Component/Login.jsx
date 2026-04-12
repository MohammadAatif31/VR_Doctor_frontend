import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useUI } from "../context/UIContext";

function Login() {
  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
const [googleLoading, setGoogleLoading] = useState(false);

 const { showToast } = useUI();
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true)

    try {
      await login(form.email, form.password);
      showToast("Login successful" , "success");
      sessionStorage.removeItem("currentChatId")
      navigate("/");
    } catch {
     showToast("Invalid email or password", "error");
    }finally {
      setLoading(false)
    }
  };

const handleGoogleLogin = (e) => {
  e.preventDefault();
  setGoogleLoading(true)
  window.location.href =
    `${import.meta.env.VITE_API_URL}/auth/google`;
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-900 to-black text-white">
    
      <form
        onSubmit={handleSubmit}
        className="w-95 bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl shadow-2xl space-y-5"
      >
        <div className="flex justify-center mb-4">
  <img
    src="/vite.svg"
    alt="logo"
   className="w-16 h-16 rounded-full object-cover shadow-lg border-2 border-blue-600 p-1 bg-white/10 backdrop-blur-md"
  />
</div>
        <h2 className="text-2xl font-bold text-center mb-2">
          Welcome Back 
        </h2>

        <p className="text-gray-400 text-center text-sm">
         VR Doctor Login to  continue
        </p>

        <input
          name="email"
          placeholder="Email Address"
          value={form.email}
          onChange={handleChange}
          className="w-full p-4 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-green-500"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full p-4 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-green-500"
        />

       <button
  disabled={loading}
  className={`w-full p-4 rounded-lg font-semibold transition 
  ${loading ? "bg-gray-500 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
>
  {loading ? "Logging in..." : "Login"}
</button>

    <button
  type="button"
  disabled={googleLoading}
  onClick={handleGoogleLogin}
  className={`w-full px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition
  ${googleLoading ? "bg-gray-300 cursor-not-allowed" : "bg-white text-black hover:bg-gray-200"}`}
>
  {googleLoading ? (
    "Redirecting..."
  ) : (
    <>
      <img src="https://img.icons8.com/color/16/google-logo.png" />
      Continue with Google
    </>
  )}
</button>

        <p className="text-center text-sm text-gray-400">
          New user?{" "}
          <Link to="/register" className="text-blue-400 hover:underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
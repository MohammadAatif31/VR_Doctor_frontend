import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useUI } from "../context/UIContext";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

 const { showToast } = useUI();
  const { register } = useAuth();
  const navigate = useNavigate();

  const [googleLoading, setGoogleLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await register(form.name, form.email, form.password);
      showToast("🎉 Account created successfully","success");
      navigate("/chat")
    } catch {
      showToast("Account created successfully", "error");
    }
  };

  

const handleGoogleRegister = (e) => {
  e.preventDefault();
  setGoogleLoading(true);

  window.location.href = "http://localhost:4002/bot/v1/auth/google";
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-900 to-black text-white">

      <form
        onSubmit={handleSubmit}
        className="w-95 bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl shadow-2xl space-y-5"
      >
        <div className="flex justify-center mb-4">
  <img
    src="/Firefly.jpg"
    alt="logo"
    className="w-16 h-16 rounded-full object-cover shadow-lg border-2 border-blue-600 p-1 bg-white/10 backdrop-blur-md"
  />
</div>
        <h2 className="text-2xl font-bold text-center mb-2">
          Create Account
        </h2>

        <p className="text-gray-400 text-center text-sm">
          Start your VR Doctor journey
        </p>

        <input
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          className="w-full p-4 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500"
        />

        <input
          name="email"
          placeholder="Email Address"
          value={form.email}
          onChange={handleChange}
          className="w-full p-4 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full p-4 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500"
        />

        <button className="w-full bg-blue-600 hover:bg-blue-700 transition p-4 rounded-lg font-semibold">
          Register
        </button>

     <button
  type="button"
  disabled={googleLoading}
  onClick={handleGoogleRegister}
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
          Already have an account?{" "}
          <Link to="/login" className="text-blue-400 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
import { useState, useEffect } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { useAuth } from "../hooks/useAuth";
import { FiUser } from "react-icons/fi";
import { useUI } from "../context/UIContext";

function Profile() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
 const [editingPassword, setEditingPassword] = useState(false);
 const [newPassword, setNewPassword] = useState("");
   const { showConfirm, showToast, setConfirm} = useUI();
const [loadingProfile, setLoadingProfile] = useState(true);

  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    weight: "",
    bloodGroup: "",
    allergies: "",
    diseases: "",
    photo: "",
  });



const handleLogout = () => {
  showConfirm({
    title: "Logout",
    message: "Are you sure?",
    onConfirm: async () => {
      try {
        setConfirm(null); // ✅ close modal

        sessionStorage.removeItem("currentChatId");

        await logout();

        showToast("Logged out successfully", "success");

        navigate("/login");

      } catch {
        showToast("Logout failed", "error");
      }
    }
  });
};
 // ================= LOAD PROFILE =================
useEffect(() => {

  let isMounted = true; // ✅ memory leak safe

  const getProfile = async () => {
    try {
      setLoadingProfile(true); // ✅ loading start

      const res = await API.get("/profile/user", {
        withCredentials: true,
      });

      const data = res?.data || {};

      if (!isMounted) return;

      setForm((prev) => ({
        ...prev,

        // ✅ SAFE NAME (no empty string bug)
        name:
          data?.name && data.name.trim() !== ""
            ? data.name
            : user?.name || "",

        age: data?.age || "",
        gender: data?.gender || "",
        weight: data?.weight || "",
        bloodGroup: data?.bloodGroup || "",
        allergies: data?.allergies || "",
        diseases: data?.diseases || "",

        // ✅ ONLY BACKEND IMAGE (NO FALLBACK)
        photo:
          data?.photo && data.photo.trim() !== ""
            ? data.photo
            : "",
      }));

      setEditing(false);

    } catch (err) {
      console.log(err);

      if (!isMounted) return;

      // ✅ fallback only name (safe)
      setForm((prev) => ({
        ...prev,
        name: user?.name || "",
      }));

      setEditing(true);

    } finally {
      if (isMounted) {
        setLoadingProfile(false); // ✅ loading stop
      }
    }
  };

  if (user) {
    getProfile(); // ✅ run only when user ready
  }

  return () => {
    isMounted = false; // ✅ cleanup
  };

}, [user]);

  // ================= INPUT CHANGE =================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ================= IMAGE =================
  const handleImage = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  setForm({ ...form, photo: file });
};

  // ================= SAVE =================
  const handleSubmit = async () => {
    try {
      setLoading(true);

   const formData = new FormData();

Object.keys(form).forEach((key) => {
  formData.append(key, form[key]);
});

const res = await API.post("/profile/save", formData, {
  headers: { "Content-Type": "multipart/form-data" },
});

// ⭐ sidebar + app update
updateUser({
  name: res.data.name,
  photo:res.data.photo,
});

      setEditing(false);
      showToast("Profile saved successfully", "success");
    } catch {
    showToast("Save failed", "error");
    }

    setLoading(false);
  };

//--password change function--//
const handlePasswordChange = async () => {
  try {
    if (!newPassword) {
      showToast("Please enter a new password", "error");
      return;
    }

    await API.post(
      "/auth/change-password",
      { newPassword },
      { withCredentials: true }
    );

    showToast("Password updated successfully", "success");

    setEditingPassword(false);
    setNewPassword("");

  } catch (err) {
    showToast(err.response?.data?.message || "Error", "error");
  }
};

useEffect(() => {

window.scrollTo(0,0);


}, []);


//-----mutiple chats delete---//
const handleDeleteAllChats = () => {
  showConfirm({
    title: "Delete All Chats",
    message: "This will delete all chats permanently!",
    onConfirm: async () => {
      try {
        // ✅ modal close instantly
        setConfirm(null);

        await API.delete("/chat/all");

        showToast("All chats deleted successfully", "info");

      } catch {
        showToast("Failed to delete chats", "error");
      }
    }
  });
};

  return (
   <div className="min-h-screen  text-white">
{/* ================= HEADER ================= */}
<div className="fixed top-0 left-0 w-full z-50 backdrop-blur-xl bg-[#0d0d0d]/90 rounded-b-xl">

  <div className="max-w-4xl mx-auto flex items-center justify-between px-4 py-4">

    {/* BACK BUTTON */}
    <button
      onClick={() => navigate("/")}
      className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 transition hover:scale-105 shadow"
    >
      <FiArrowLeft size={20}/>
    </button>

    {/* TITLE */}
    <h1 className="text-xl font-bold bg-linear-to-r from-blue-500 to-indigo-600 px-5 py-2 rounded-xl">
      VR Doctor
    </h1>

  </div>

</div>
      <div className="max-w-4xl mx-auto space-y-8 pt-20">

        {/* PROFILE CARD */}
       <div className="bg-gray-900/70 backdrop-blur-xl p-6 rounded-3xl border border-gray-800 shadow-xl transition-all duration-700 ease-in-out">
          {/* PROFILE HEADER */}
<div className="flex items-center gap-2 mb-6">
  <FiUser size={20} className="text-blue-600" />
  <h2 className="text-xl font-semibold">Profile Info</h2>
</div>
          {/* ⭐ FIX 2 — IMAGE CENTER ALWAYS */}
          <div className="flex flex-col items-center gap-4">

            <div className="w-32 flex flex-col items-center">
   {loadingProfile ? (
  <div className="w-28 h-28 rounded-full bg-gray-700 animate-pulse"></div>
) : (
  <img
    src={
      form.photo instanceof File
        ? URL.createObjectURL(form.photo)
        : form.photo
    }
    className="w-28 h-28 rounded-full border-3 border-blue-600 object-cover"
  />
)}
              {editing && (
                <input
                  type="file"
                  onChange={handleImage}
                  className="mt-3 text-xs"
                />
              )}
            </div>

            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="bg-linear-to-r from-blue-600 to-indigo-700 send-btn px-5 py-2 rounded-xl"
              >
                Edit Profile
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-green-600 px-5 py-2 rounded-xl hover:bg-green-700"
              >
                {loading ? "Saving..." : "Save Profile"}
              </button>
            )}
          </div>

          {/* FORM */}
   <div
  className={`grid md:grid-cols-2 gap-4 mt-6 
  transition-all duration-700 ease-in-out transform-gpu
  ${
    editing
      ? "opacity-100 translate-y-0 scale-100"
      : "opacity-80 translate-y-4 scale-[0.98]"
  }`}
>

          {/* NAME */}
<div className="flex flex-col gap-1">
  <label className="text-sm text-gray-400">Name</label>
  <input
    name="name"
    value={form.name}
    onChange={handleChange}
    disabled={!editing}
    className="p-3 rounded-xl bg-gray-800 outline-none"
  />
</div>

{/* AGE */}
<div className="flex flex-col gap-1">
  <label className="text-sm text-gray-400">Age</label>
  <input
    name="age"
    value={form.age}
    onChange={handleChange}
    disabled={!editing}
    className="p-3 rounded-xl bg-gray-800 outline-none"
  />
</div>

{/* GENDER */}
<div className="flex flex-col gap-1">
  <label className="text-sm text-gray-400">Gender</label>
  <select
    name="gender"
    value={form.gender}
    onChange={handleChange}
    disabled={!editing}
    className="p-3 rounded-xl bg-gray-800"
  >
    <option value="">Select Gender</option>
    <option>Male</option>
    <option>Female</option>
  </select>
</div>

{/* WEIGHT */}
<div className="flex flex-col gap-1">
  <label className="text-sm text-gray-400">Weight</label>
  <input
    name="weight"
    value={form.weight}
    onChange={handleChange}
    disabled={!editing}
    className="p-3 rounded-xl bg-gray-800"
  />
</div>

{/* BLOOD GROUP */}
<div className="flex flex-col gap-1">
  <label className="text-sm text-gray-400">Blood Group</label>
  <input
    name="bloodGroup"
    value={form.bloodGroup}
    onChange={handleChange}
    disabled={!editing}
    className="p-3 rounded-xl bg-gray-800"
  />
</div>

{/* ALLERGIES */}
<div className="flex flex-col gap-1">
  <label className="text-sm text-gray-400">Allergies</label>
  <input
    name="allergies"
    value={form.allergies}
    onChange={handleChange}
    disabled={!editing}
    className="p-3 rounded-xl bg-gray-800"
  />
</div>

{/* DISEASES */}
<div className="flex flex-col gap-1 md:col-span-2 mb-2">
  <label className="text-sm text-gray-400">Diseases</label>
  <input
    name="diseases"
    value={form.diseases}
    onChange={handleChange}
    disabled={!editing}
    className="p-3 rounded-xl bg-gray-800"
  />
</div>
</div>
        </div>

        {/* ACCOUNT SECTION */}
        <div className="bg-gray-900/70 backdrop-blur-xl p-6 rounded-3xl border border-gray-800 shadow-xl space-y-4">

          <h2 className="text-xl font-semibold">⚙ Account</h2>
     {/* EMAIL */}
<div className="flex flex-col gap-1">
  <label className="text-sm text-gray-400">Email</label>
  <input
    value={user?.email || ""}
    disabled
    className="p-3 rounded-xl bg-gray-800 opacity-70 cursor-not-allowed"
  />

</div>

{/* PASSWORD SECTION */}
<div className="flex flex-col gap-2 mt-6">

  <label className="text-sm text-gray-400">Password</label>

  <div className="flex items-center gap-3">

    {!editingPassword ? (
      <>
        <input
          type="password"
          value="********"
          disabled
          className="p-3 rounded-xl bg-gray-800 opacity-70 flex-1"
        />

        <button
          onClick={() => setEditingPassword(true)}
          className="px-5 py-3 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-700 send-btn"
        >
          Edit
        </button>
      </>
    ) : (
      <div className="w-full space-y-3 animate-fadeIn">

        {/* INPUT */}
        <div className="relative">
          <input
            type="password"
            placeholder="Enter new password..."
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-4 rounded-xl bg-gray-800 border border-gray-700 
            focus:outline-none focus:border-green-500 pr-12"
          />

          {/* ICON */}
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            
          </span>
        </div>

        {/* BUTTONS */}
        <div className="flex gap-3">

          <button
            onClick={handlePasswordChange}
            className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-700 transition font-semibold"
          >
            Save
          </button>

          <button
            onClick={() => {
              setEditingPassword(false);
              setNewPassword("");
            }}
            className="flex-1 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 transition"
          >
            Cancel
          </button>

        </div>

      </div>
    )}

  </div>
</div>
      
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full py-3 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-700 
            send-btn"
          >
            Dashboard
          </button>

          {user?.role === "admin" && (
         <button
        onClick={() => navigate("/admin")}
       className="w-full py-3 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-700 
            send-btn">
    Admin Panel
  </button>
)}

          <button
            onClick={handleDeleteAllChats}
            className="w-full py-3 rounded-2xl bg-red-600 hover:bg-red-700 font-semibold"
          >
            Delete All Chats
          </button>

          <button
            onClick={handleLogout}
            className="w-full py-3 rounded-2xl bg-gray-700 hover:bg-gray-600 font-semibold"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
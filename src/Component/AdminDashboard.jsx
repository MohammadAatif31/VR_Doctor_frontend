/* eslint-disable react-hooks/immutability */
import { useEffect,useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import API from "../api/axios";
import { FiTrash2 } from "react-icons/fi";
import { useUI } from "../context/UIContext";
import CryptoJS from "crypto-js";

import {
LineChart,
Line,
XAxis,
YAxis,
Tooltip,
ResponsiveContainer
} from "recharts";

export default function AdminDashboard(){

const navigate = useNavigate();

const [stats,setStats] = useState({});
const [users,setUsers] = useState([]);
const [chats,setChats] = useState([]);
const [healthLogs,setHealthLogs] = useState([]);
const [selectedChat,setSelectedChat] = useState(null);
const [search,setSearch] = useState("");
const [analytics,setAnalytics] = useState([]);
const [visibleLogs,setVisibleLogs] = useState(7);
const [visibleChats,setVisibleChats] = useState(7);
const [expandedChat,setExpandedChat] = useState(null);
const [premiumUsers, setPremiumUsers] = useState([]);
const { showConfirm, showToast, setConfirm } = useUI();

// ================= INIT =================

useEffect(() => {

  const init = async () => {
    window.scrollTo(0,0);

    await fetchDashboard();
    await fetchAnalytics();
  };

  init();

}, []);

//-------Decrypt message--//


const decryptText = (encrypted) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, "secret");
    return bytes.toString(CryptoJS.enc.Utf8) || encrypted;
  } catch {
    return encrypted;
  }
};

// ================= FETCH DASHBOARD =================

const fetchDashboard = async()=>{

try{

const res = await API.get("/admin/dashboard",{withCredentials:true});

setStats(res.data.stats || {});
setUsers(res.data.latestUsers || []);
setChats(res.data.latestChats || []);
setHealthLogs(res.data.latestHealthLogs || []);

}catch(err){

console.log(err);

}

};


// ================= ANALYTICS =================

const fetchAnalytics = async()=>{

try{

const res = await API.get("/admin/analytics",{withCredentials:true});

setAnalytics(res.data.dailyChats || []);

}catch(err){

console.log(err);

}

};


// ================= DELETE USER =================

const deleteUser = (id) => {
  showConfirm({
    title: "Delete User",
    message: "Are you sure you want to delete this user?",
    onConfirm: async () => {
      try {
        setConfirm(null);

        await API.delete(`/admin/user/${id}`);

        setUsers(prev => prev.filter(u => u._id !== id));

        showToast("User deleted", "success");

      } catch {
        showToast("Failed to delete user", "error");
      }
    }
  });
};


// ================= BAN USER =================
const toggleBan = (id, isBanned) => {

  showConfirm({
    title: isBanned ? "Unban User" : "Ban User",
    message: isBanned
      ? "Do you want to unban this user?"
      : "This user will be blocked from using the app. Continue?",
    
    onConfirm: async () => {
      try {
        // ✅ modal close instantly
        setConfirm(null);

        await API.patch(`/admin/user/ban/${id}`);

        // UI update (fast feedback)
        setUsers(prev =>
          prev.map(user =>
            user._id === id
              ? { ...user, isBanned: !user.isBanned }
              : user
          )
        );

        showToast(
          isBanned ? "User unbanned" : "User banned",
          "success"
        );

      } catch {
        showToast("Action failed", "error");
      }
    }
  });

};


// ================= DELETE CHAT =================
const deleteChat = (id) => {
  showConfirm({
    title: "Delete Chat",
    message: "Delete this chat? This cannot be undone.",
    onConfirm: async () => {
      try {
        setConfirm(null);

        await API.delete(`/admin/chat/${id}`);

        setChats(prev => prev.filter(c => c._id !== id));

        showToast("Chat deleted", "success");

      } catch {
        showToast("Delete failed", "error");
      }
    }
  });
};

// ================= DELETE HEALTH LOG =================
const handleDeleteHealthLog = (id) => {
  showConfirm({
    title: "Delete Health Log",
    message: "Are you sure you want to delete this?",
    onConfirm: async () => {
      try {
        setConfirm(null);

        await API.delete(`/admin/healthlog/${id}`, {
          withCredentials: true
        });

        setHealthLogs(prev => prev.filter(log => log._id !== id));

        showToast("Health log deleted", "success");

      } catch {
        showToast("Delete failed", "error");
      }
    }
  });
};



// ================= DELETE ALL CHATS =================

const deleteAllChats = () => {
  showConfirm({
    title: "Delete All Chats",
    message: "This will delete ALL chats permanently!",
    onConfirm: async () => {
      try {
        setConfirm(null);

        await API.delete("/admin/chats/all", { withCredentials: true });

        setChats([]);

        showToast("All chats deleted", "info");

      } catch {
        showToast("Failed to delete chats", "error");
      }
    }
  });
};

//-----Money collection function--//
useEffect(() => {
  const fetchPremiumUsers = async () => {
    try {
      const res = await API.get("/admin/premium-users", {
        withCredentials: true,
      });

      setPremiumUsers(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  fetchPremiumUsers();
}, []);

return(
<div className="min-h-screen bg-linear-to-br from-gray-900 to-black text-white p-4">

{/* ================= HEADER ================= */}

<div className="fixed top-0 left-0 w-full z-50 backdrop-blur-xl  bg-linear-to-br from-gray-900 to-black rounded-2xl">

  <div className="max-w-7xl mx-auto flex items-center justify-between p-3 gap-3">

    <button
      onClick={() => navigate("/profile")}
      className="p-3 rounded-full bg-gray-800 hover:bg-gray-700"
    >
      <FiArrowLeft size={22} />
    </button>

    <h1 className="text-2xl font-bold mr-3">
      Admin Control Panel
    </h1>

  </div>

</div>


<div className="max-w-7xl mx-auto pt-17.5">


{/* ================= STATS ================= */}

<div className="grid md:grid-cols-5 gap-4 mb-6">

<div className="bg-gray-800 p-6 rounded-xl text-center shadow">
<h3 className="text-gray-400">Total Users</h3>
<p className="text-3xl font-bold">{stats.totalUsers}</p>
</div>

<div className="bg-gray-800 p-6 rounded-xl text-center shadow">
<h3 className="text-gray-400">Total Chats</h3>
<p className="text-3xl font-bold">{stats.totalChats}</p>
</div>

<div className="bg-gray-800 p-6 rounded-xl text-center shadow">
<h3 className="text-gray-400">Health Logs</h3>
<p className="text-3xl font-bold">{stats.totalHealthLogs}</p>
</div>

{/* PREMIUM */}
<div className="bg-linear-to-r from-yellow-500 to-orange-500 p-6 rounded-xl text-center shadow">
  <h3 className="text-white">Premium Users</h3>
  <p className="text-3xl font-bold text-white">
    {stats.totalPremiumUsers || 0}
  </p>
</div>

{/*  REVENUE */}
<div className="bg-linear-to-r from-green-500 to-emerald-600 p-6 rounded-xl text-center shadow">
  <h3 className="text-white">Revenue</h3>
  <p className="text-3xl font-bold text-white">
    ₹{stats.revenue || 0}
  </p>
</div>

</div>



{/* ================= CHART ================= */}

<div className="bg-gray-800 p-6 rounded-xl mb-6 shadow">

<h2 className="mb-4 font-semibold">
Daily Chat Activity
</h2>

<ResponsiveContainer width="100%" height={250}>

<LineChart data={analytics}>

<XAxis dataKey="_id"/>

<YAxis/>

<Tooltip/>

<Line type="monotone" dataKey="count" stroke="#3b82f6"/>

</LineChart>

</ResponsiveContainer>

</div>

{/* premium user and money*/}
<div className="mt-6 bg-gray-900 p-4 rounded-xl mb-5">
  <h2 className="text-lg font-bold text-yellow-400 mb-4 flex items-center gap-2">
     Premium Users
  </h2>

  {premiumUsers.length === 0 ? (
    <p className="text-gray-400">No premium users yet</p>
  ) : (
    premiumUsers.map((user) => (
      <div
        key={user._id}
        className="flex justify-between items-center text-sm text-gray-300 py-3 border-b border-gray-700"
      >
        <span className="font-medium">{user.name}</span>

        <span className="text-gray-400">{user.email}</span>

       <span className="text-yellow-400">
  {user.premiumExpiry
    ? new Date(user.premiumExpiry).toLocaleDateString()
    : "Not Activated"}
</span>
      </div>
    ))
  )}
</div>


{/* ================= USERS ================= */}

<div className="bg-gray-800 p-6 rounded-xl mb-6 shadow">

<h2 className="font-semibold mb-4">
Users Management
</h2>

<input
type="text"
placeholder="Search user..."
value={search}
onChange={(e)=>setSearch(e.target.value)}
className="w-full p-3 rounded-lg bg-gray-900 border border-gray-700 mb-4"
/>



{/* DESKTOP TABLE */}

<div className="hidden md:block overflow-x-auto">

<table className="w-full text-sm">

<thead>

<tr className="text-gray-400">

<th className="text-left py-2">Name</th>
<th className="text-left">Email</th>
<th className="text-left">Action</th>

</tr>

</thead>

<tbody>

{users
.filter(u =>
u.name.toLowerCase().includes(search.toLowerCase())
)
.map(user=>(
<tr key={user._id} className="border-t border-gray-700">

<td className="py-3">{user.name}</td>

<td>{user.email}</td>

<td>

<button
onClick={()=>deleteUser(user._id)}
className="bg-red-500 hover:bg-red-700 px-3 py-1.5 rounded-xl "
>
Delete
</button>

<button
onClick={()=>toggleBan(user._id)}
className="bg-yellow-500 hover:bg-yellow-600 px-3 py-1.5 rounded-xl ml-3"
>
{user.isBanned ? "Unban":"Ban"}
</button>

</td>

</tr>
))}

</tbody>

</table>

</div>



{/* MOBILE CARDS */}

<div className="md:hidden space-y-3">

{users.map(user=>(

<div
key={user._id}
className="bg-gray-900 p-4 rounded-lg flex flex-col gap-2 shadow"
>

<div className="flex justify-between">

<p className="font-semibold">
{user.name}
</p>

<p className="text-sm text-gray-400">
{user.email}
</p>

</div>

<div className="flex gap-2">

<button
onClick={()=>deleteUser(user._id)}
className="bg-red-500 hover:bg-red-700 flex-1 py-1.5 rounded-xl text-sm"
>
Delete
</button>

<button
onClick={()=>toggleBan(user._id)}
className="bg-yellow-500 hover:bg-yellow-600 flex-1 py-1.5 rounded-xl text-sm"
>
{user.isBanned ? "Unban":"Ban"}
</button>

</div>

</div>

))}

</div>

</div>


{/* ================= CHATS ================= */}

<div className="bg-gray-800 p-6 rounded-xl mb-6 shadow">

<div className="flex justify-between items-center mb-4">

<h2 className="font-semibold">
Latest Chats
</h2>

<button
onClick={deleteAllChats}
className="bg-red-600 hover:bg-red-700 px-4 py-1.5  rounded-xl text-sm"
>
Delete All
</button>

</div>


{/* DESKTOP TABLE */}

<div className="hidden md:block overflow-x-auto">

<table className="w-full text-sm">

<thead>

<tr className="text-gray-400">

<th>User</th>
<th>Message</th>
<th>Date</th>
<th>Action</th>

</tr>

</thead>

<tbody>

{chats.slice(0,visibleChats).map(chat=>{

const lastMessage = chat.messages?.[chat.messages.length - 1];

const rawText = lastMessage?.text || lastMessage?.message || "";

const fullMsg = rawText
  ? decryptText(rawText)
  : "No message";

const msg =
  expandedChat === chat._id
    ? fullMsg
    : fullMsg.slice(0, 90);

return(

<tr key={chat._id} className="border-t border-gray-700">

<td>
{chat.userId?.name || "Unknown"}
</td>

<td className="max-w-md truncate">

{msg}
<button
onClick={() =>
setExpandedChat(
expandedChat === chat._id ? null : chat._id
)
}
className="text-blue-400 text-xs ml-2 hover:underline"
>
{expandedChat === chat._id ? "Less" : "More"}
</button>

</td>

<td>

{chat.createdAt
? new Date(chat.createdAt).toLocaleString()
: "No Date"}

</td>

<td>

<button
title="Delete chat"
onClick={()=>deleteChat(chat._id)}
className="bg-red-500 hover:bg-red-700 p-2 rounded-xl flex items-center justify-center transition"
>
<FiTrash2 size={16}/>
</button>

</td>

</tr>

);

})}

</tbody>

</table>

</div>



{/* MOBILE CARDS */}

<div className="md:hidden space-y-3">

{chats.slice(0,visibleChats).map(chat=>{
  
const lastMessage = chat.messages?.[chat.messages.length - 1];

const rawText = lastMessage?.text || lastMessage?.message || "";

const fullMsg = rawText
  ? decryptText(rawText)
  : "No message";

const msg =
  expandedChat === chat._id
    ? fullMsg
    : fullMsg.slice(0, 90);
return(

<div
key={chat._id}
className="bg-gray-900 p-4 rounded-lg shadow"
>
<div className="flex justify-between items-center">

<p className="text-sm text-gray-300 font-semibold">
{chat.userId?.name || "Unknown"}
</p>

<p className="text-xs text-gray-400">

{chat.createdAt
? new Date(chat.createdAt).toLocaleDateString()
: "No Date"}

</p>

</div>


<p className="mt-1 text-sm">
{msg}...
</p>

<div className="flex justify-between mt-2">
<button
onClick={() =>
setExpandedChat(
expandedChat === chat._id ? null : chat._id
)
}
className="text-blue-400 text-xs ml-2 hover:underline"
>
{expandedChat === chat._id ? "Less" : "More"}
</button>

<button
title="Delete chat"
onClick={()=>deleteChat(chat._id)}
className="bg-red-500 hover:bg-red-700 p-2 rounded-xl flex items-center justify-center transition"
>
<FiTrash2 size={16}/>
</button>

</div>

</div>

);

})}

</div>



{/* MORE / LESS BUTTON */}

<div className="flex justify-center mt-4 gap-3">

{visibleChats < chats.length && (

<button
onClick={()=>setVisibleChats(prev=>prev+10)}
className="bg-blue-500 px-4 py-1 rounded text-sm hover:bg-blue-600"
>

More

</button>

)}

{visibleChats > 7 && (

<button
onClick={()=>setVisibleChats(7)}
className="bg-gray-700 px-4 py-1 rounded text-sm hover:bg-gray-600"
>

Less

</button>

)}

</div>

</div>


{/* ================= HEALTH LOGS ================= */}

<div className="bg-gray-800 p-6 rounded-xl mb-6 shadow">

<div className="flex justify-between items-center mb-4">

<h2 className="font-semibold text-lg">
Health Logs
</h2>

<button
onClick={() => {
  showConfirm({
    title: "Delete All Health Logs",
    message: "This will delete all logs permanently!",
    onConfirm: async () => {
      try {
        setConfirm(null);

        await API.delete("/admin/healthlogs/all", {
          withCredentials: true
        });

        setHealthLogs([]);

        showToast("All health logs deleted", "info");

      } catch {
        showToast("Failed to delete logs", "error");
      }
    }
  });
}}

className="bg-red-600 hover:bg-red-700 px-4 py-1.5 rounded-xl text-sm"
>

Delete All

</button>

</div>


{/* ================= DESKTOP TABLE ================= */}

<div className="hidden md:block overflow-x-auto">

<table className="w-full text-sm">

<thead>

<tr className="text-gray-400">

<th className="text-left py-2">User</th>
<th className="text-left">Symptoms</th>
<th className="text-left">Risk</th>
<th className="text-left">Date</th>
<th className="text-left">Action</th>

</tr>

</thead>

<tbody>

{healthLogs
.slice(0,visibleLogs)
.map(log=>{

const symptoms = Array.isArray(log.symptoms)
? log.symptoms.join(", ")
: log.symptoms || "None";

return(

<tr key={log._id} className="border-t border-gray-700">

<td className="py-3">
{log.userId?.name || "Unknown"}
</td>

<td className="max-w-xs truncate">
{symptoms}
</td>

<td>

<span
className={`px-2 py-1 rounded text-xs font-semibold

${log.severity === "high" ? "text-red-400" : ""}
${log.severity === "medium" ? "text-yellow-400" : ""}
${log.severity === "low" ? "text-green-400" : ""}

`}
>

{log.severity || "low"}

</span>

</td>

<td className="text-gray-400">
{log.createdAt
? new Date(log.date).toLocaleString()
: "No Date"}
</td>

<td>

<button
title="Delete log"
onClick={()=>handleDeleteHealthLog(log._id)}
className="bg-red-500 hover:bg-red-700 p-2 rounded-xl flex items-center justify-center transition"
>
<FiTrash2 size={16}/>
</button>

</td>

</tr>

);

})}

</tbody>

</table>

</div>


{/* ================= MOBILE CARDS ================= */}

<div className="md:hidden space-y-3">

{healthLogs
.slice(0,visibleLogs)
.map(log=>{

const symptoms = Array.isArray(log.symptoms)
? log.symptoms.join(", ")
: log.symptoms || "None";

return(

<div
key={log._id}
className="bg-gray-900 p-4 rounded-lg shadow text-sm"
>

<div className="flex justify-between">

<p className="font-semibold text-gray-200">
{log.userId?.name || "Unknown"}
</p>

<p className="text-gray-400 text-xs">
{log.createdAt
? new Date(log.date).toLocaleDateString()
: "No Date"}
</p>

</div>

<p className="text-gray-300 mt-2 text-xs">

{symptoms}

</p>

<div className="flex justify-between items-center mt-3">

<p className={`px-2 py-1 rounded text-xs font-semibold

${log.severity === "high" ? "text-red-400" : ""}
${log.severity === "medium" ? "text-yellow-400" : ""}
${log.severity === "low" ? "text-green-400" : ""}

`}
>
 {log.severity || "low"}
</p>

<button
title="Delete log"
onClick={()=>handleDeleteHealthLog(log._id)}
className="bg-red-500 hover:bg-red-600 p-2 rounded-lg flex items-center justify-center transition"
>
<FiTrash2 size={16}/>
</button>

</div>

</div>

);

})}

</div>


{/* ================= MORE / LESS BUTTON ================= */}

<div className="flex justify-center gap-3 mt-4">

{visibleLogs < healthLogs.length && (

<button
onClick={()=>setVisibleLogs(prev=>prev+10)}
className="bg-blue-500 hover:bg-blue-600 px-4 py-1 rounded text-sm"
>

More

</button>

)}

{visibleLogs > (window.innerWidth < 768 ? 7 : 10) && (

<button
onClick={()=>setVisibleLogs(
window.innerWidth < 768 ? 7 : 10
)}
className="bg-gray-700 hover:bg-gray-600 px-4 py-1 rounded text-sm"
>

Less

</button>

)}

</div>

</div>


{/* ================= CHAT MODAL ================= */}

{selectedChat && (

<div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4">

<div className="bg-gray-900 w-full max-w-lg p-6 rounded-xl max-h-[80vh] overflow-y-auto">

<h3 className="mb-4 font-semibold">
Chat History
</h3>

{selectedChat.messages.map((m,i)=>(

<div
key={i}
className={`p-3 rounded mb-2 ${
m.sender==="user"
? "bg-blue-600"
: "bg-gray-700"
}`}
>

{m.text}

</div>

))}

<button
onClick={()=>setSelectedChat(null)}
className="bg-red-500 px-4 py-2 rounded mt-3"
>
Close
</button>

</div>

</div>

)}

</div>

</div>

);

}
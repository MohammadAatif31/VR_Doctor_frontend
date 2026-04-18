import React, { useEffect, useRef, useState } from "react";
import API from "../api/axios";
import { FiMenu } from "react-icons/fi";
import Typed from "typed.js";
import { FaPenToSquare } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { PiStethoscopeBold } from "react-icons/pi";
import { FaMicrophone } from "react-icons/fa";
import { useUI } from "../context/UIContext";

function Bot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const typedRef = useRef(null);
  const typedInstance = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [allChats, setAllChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const chatIdRef = useRef(null);
  const [search, setSearch] = useState("");
  const [profile, setProfile] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const chatContainerRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const isAtBottomRef = useRef(true);
  const [showPremium, setShowPremium] = useState(false);
  const [remaining, setRemaining] = useState(5);
  const { showToast, showConfirm ,setConfirm} = useUI();


  // ===============================
  // LOGOUT FUNCTION
  // ===============================
  const { user, logout } = useAuth();

  const navigate = useNavigate();

const handleLogout = () => {
  showConfirm({
    title: "Logout",
    message: "Are you sure?",
    onConfirm: async () => {
      sessionStorage.removeItem("currentChatId")
      await logout();
      navigate("/login");
    }
  });
};

  //--sidebaropen chat section close--//
useEffect(() => {
  if (sidebarOpen) {
    document.body.classList.add("sidebar-open");
    document.documentElement.classList.add("sidebar-open");
  } else {
    document.body.classList.remove("sidebar-open");
    document.documentElement.classList.remove("sidebar-open");
  }

  return () => {
    document.body.classList.remove("sidebar-open");
    document.documentElement.classList.remove("sidebar-open");
  };
}, [sidebarOpen]);


  // dectect chat copy button//
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!chatContainerRef.current) return;

      if (!chatContainerRef.current.contains(event.target)) {
        setActiveIndex(null);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // username / profile load
  useEffect(() => {
    if (!user?.id) return;

  API.get("/profile/user", {
  withCredentials: true,
  skipLoader: true
})
      .then((res) => setProfile(res.data))
      .catch((err) => console.log(err));
  }, [user]);

  //----///
  useEffect(() => {
  const fetchUser = async () => {
    try {
     const { data } = await API.get("/auth/me", {
  skipLoader: true
});

      // ADMIN → unlimited
      if (data.role === "admin") {
        setRemaining("∞");
        return;
      }

      // PREMIUM → unlimited
      if (data.isPremium) {
        setRemaining("∞");
        return;
      }

      // NORMAL USER
      const count = data.messageCount || 0;
      setRemaining(Math.max(5 - count, 0));

    } catch (err) {
      console.log(err);
    }
  };

  fetchUser();
}, []);

  //  long press state
  const holdTimer = useRef(null);

  const handleMouseDown = (chatId, title) => {
    holdTimer.current = setTimeout(() => {
      deleteSingleChat(chatId, title);
    }, 1000); // 1 second hold
  };

  const cancelLongPress = () => {
    clearTimeout(holdTimer.current);
  };

  // handle new Chat
  // ✅ create empty session only (no save yet)
  const handleNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
    chatIdRef.current = null;
    sessionStorage.removeItem("currentChatId");
    setSidebarOpen(false)
    setSearch("")
  };

  // ===============================
  // LOAD SINGLE CHAT FROM BACKEND
  // ===============================
const handleOpenChat = async (chatId, isRestore = false) => {

  // 🔥 LOOP BREAKER
  if (!chatId || chatIdRef.current === chatId) return;

  try {
    const res = await API.get(`/chat/${chatId}`, {
      withCredentials: true,
    });

    setCurrentChatId(chatId);
    chatIdRef.current = chatId;
    setMessages(res.data.messages || []);

    // ❌ IMPORTANT: setAllChats hata diya

    if (!isRestore) {
      sessionStorage.setItem("currentChatId", chatId);
    }

    setSidebarOpen(false);
    setSearch("");

  } catch (err) {
    console.log("Chat open error:", err);

    if (err?.response?.status === 404) {
      sessionStorage.removeItem("currentChatId");
    }
  }
};

  // ⭐ LOAD ALL USER CHATS (SIDEBAR FIX)
  const hasFetched = useRef(false);

useEffect(() => {
  if (!user?.id || hasFetched.current) return;

  hasFetched.current = true;

  const fetchChats = async () => {
    try {
      const res = await API.get("/chat/user", {
        withCredentials: true,
      });

      setAllChats(res.data || []);

    } catch (err) {
      console.log("Chat load error:", err);
    }
  };

  fetchChats();

}, [user?.id]);

  // ⭐ RESTORE CHAT AFTER REFRESH
 useEffect(() => {
  if (!user?.id) return;

  const savedChatId = sessionStorage.getItem("currentChatId");

  if (
    savedChatId &&
    savedChatId !== chatIdRef.current
  ) {
    handleOpenChat(savedChatId, true);
  }

}, [user?.id]);

  // auto scroll to bottom
  useEffect(() => {
  isAtBottomRef.current = true;
}, []);

  useEffect(() => {

  if (!isAtBottomRef.current) return;

  messagesEndRef.current?.scrollIntoView({
    behavior: "smooth",
  });

}, [messages, loading]);

  //animation for first time when no messages
  useEffect(() => {
    // only run when no messages
    if (messages.length === 0 && typedRef.current) {
      typedInstance.current = new Typed(typedRef.current, {
        strings: [
          "Virtual DOCTOR",
          "Your Health Assistant",
          "Ask any Symptoms",
        ],
        typeSpeed: 60,
        backSpeed: 40,
        backDelay: 1000,
        loop: true, //  continuous animation
        showCursor: true,
      });
    }

    // stop animation when user sends message
    if (messages.length > 0 && typedInstance.current) {
      typedInstance.current.destroy();
    }

    return () => {
      if (typedInstance.current) {
        typedInstance.current.destroy();
      }
    };
  }, [messages]);

  // hold start
  const handleHoldStart = (index) => {
    holdTimer.current = setTimeout(() => {
      setActiveIndex(index); // show copy button
    }, 1000); // 1 sec hold
  };

  // hold cancel
  const handleHoldEnd = () => {
    clearTimeout(holdTimer.current);
  };

  // copy click
  const handleCopy = (text, index) => {
  if (!text) return; // ⭐ safety

  navigator.clipboard.writeText(String(text));

  setCopiedIndex(index);

  setTimeout(() => {
    setCopiedIndex(null);
    setActiveIndex(null);
  }, 1000);
};
  

  //----voice input support--///
 const startVoice = () => {

  const recognition = new window.webkitSpeechRecognition();

  recognition.lang = "en-US";

  setIsRecording(true);

  recognition.start();

  recognition.onresult = (event) => {

    const transcript = event.results[0][0].transcript;

    setInput(transcript);

  };

  recognition.onend = () => {
    setIsRecording(false);
  };

};


  //--steaming animation--//
 const streamMessage = (text) => {

 let index = 0;

 const interval = setInterval(() => {

   setMessages(prev => {

     const updated = [...prev];

     const last = updated[updated.length - 1];

     if(!last || last.sender !== "bot") return prev;

     last.text = text.slice(0,index+1);

     return updated;

   });

   index++;

   if(index >= text.length){
     clearInterval(interval);
   }

 },12);

};


  // ===============================
  // SEND MESSAGE (FINAL FIXED VERSION)
  // ===============================
  const handleSendMessage = async () => {
    const cleanInput = input.trim();
    if (!cleanInput) return;

    // user message object
    const userMsg = { text: cleanInput, sender: "user" };

    // UI update instantly
    setInput("");
    setMessages((prev) => [...prev, userMsg]);
    // ⭐ LIVE COUNT UPDATE
if (remaining !== "∞") {
  setRemaining(prev => Math.max(prev - 1, 0));
}
    setLoading(true);

    try {
      // ===============================
      // SEND MESSAGE TO BACKEND
      // ===============================
      const res = await API.post(
        "/message",
        {
          text: cleanInput,
          chatId: chatIdRef.current || null, // existing chat or new chat
        },
        {
          withCredentials: true,
          skipLoader: true
        },
      );

      const backendChatId = res.data.chatId;

      // ===============================
      // SYNC CHAT ID (VERY IMPORTANT)
      // ===============================
      if (backendChatId) {
        setCurrentChatId(backendChatId);
        chatIdRef.current = backendChatId;

        // refresh ke liye save
        sessionStorage.setItem("currentChatId", backendChatId);
      }

      // ===============================
      // ADD BOT RESPONSE
      // ===============================
      setMessages((prev) => [
        ...prev,
        {
          text:"",
          sender: "bot",
        },
      ]);
      streamMessage(res.data.botMessage)
      // ===============================
      // ⭐ NEW FIX — reload sidebar chats from MongoDB
      // (chat history update + sidebar show fix)
      // ===============================
      try {
        const chatsRes = await API.get("/chat/user", {
          withCredentials: true,
          skipLoader : true
        });

        setAllChats(chatsRes.data || []);
      } catch (err) {
        console.log("Sidebar refresh error:", err);
      }
    } catch (error) {

  // ⭐ PREMIUM LIMIT HIT
  if (error?.response?.status === 403) {
    setLoading(false);
    setShowPremium(true);
    return;
  }

  setMessages((prev) => [
    ...prev,
    {
      text:
        error?.response?.data?.error ||
        "⚠️ System is facing issues. Try again later.",
      sender: "bot",
    },
  ]);
}
    setLoading(false);
  };

 //-----//
// ===============================
// 🔥 RAZORPAY SCRIPT LOADER (SAFE)
// ===============================
const loadRazorpay = () => {
  return new Promise((resolve) => {

    // already loaded → skip
    if (window.Razorpay) {
      return resolve(true);
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => {
      console.log(" Razorpay loaded");
      resolve(true);
    };

    script.onerror = () => {
      console.error("❌ Razorpay failed");
      resolve(false);
    };

    document.body.appendChild(script);
  });
};

//--payment--function--//
const handlePayment = async () => {
  try {

    // ===============================
    // 🔥 LOAD RAZORPAY (UPDATED)
    // ===============================
    const loaded = await loadRazorpay();

    if (!loaded) {
      showToast("⚠️ Payment system failed to load", "error");
      return;
    }

    // ===============================
    // CREATE ORDER (BACKEND)
    // ===============================
    const { data } = await API.post(
      "/payment/order",
      {},
      { 
        withCredentials: true,
        skipLoader: true // 🔥 no full screen loader
      }
    );

    if (!data?.id) {
      throw new Error("Order creation failed");
    }

    // ===============================
    // OPTIONS CONFIG
    // ===============================
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY,

      amount: data.amount,
      currency: data.currency,
      order_id: data.id,

      name: "AI Doctor",
      description: "Premium Subscription",

      handler: async function (response) {
        try {
          const verifyRes = await API.post(
            "/payment/verify",
            response,
            { 
              withCredentials: true,
              skipLoader: true // 🔥 important
            }
          );

          if (verifyRes.data?.success) {
            setShowPremium(false);
            setRemaining("∞");

            // ✅ TOAST SUCCESS
            showToast("🎉 Premium Activated!", "success");

            // ❌ REMOVE reload (better UX)
            // window.location.reload();
          }

        } catch (err) {
          console.log(err);

          // ❌ VERIFY FAILED
          showToast("❌ Payment verification failed", "error");
        }
      },

      prefill: {
        name: user?.name || "User",
        email: user?.email || "",
        contact: "9999999999"
      },

      theme: {
        color: "#6366f1"
      },

      config: {
        display: {
          blocks: {
            banks: {
              name: "Pay using Netbanking",
              instruments: []
            }
          }
        }
      }
    };

    // ===============================
    // OPEN RAZORPAY
    // ===============================
    const rzp = new window.Razorpay(options);

    rzp.on("payment.failed", function (response) {
      console.log("Payment failed:", response);

      // ❌ FAILED TOAST
      showToast("❌ Payment Failed", "error");
    });

    rzp.open();

  } catch (err) {
    console.log("Payment error:", err);

    //  INIT FAILED
    showToast("⚠️ Payment initialization failed", "error");
  }
};

  // enter press logic //
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey && input.trim() && !loading) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // ⭐ highlight search text in title
  const highlightText = (text) => {
    if (!search) return text;

    const parts = text.split(new RegExp(`(${search})`, "gi"));

    return parts.map((part, i) =>
      part.toLowerCase() === search.toLowerCase() ? (
        <span key={i} className="bg-yellow-400 text-black px-1 rounded">
          {part}
        </span>
      ) : (
        part
      ),
    );
  };

  //single delete//
  // ⭐ DELETE CHAT WITH CONFIRM (mobile + desktop)
const deleteSingleChat = (chatId, title) => {
showConfirm({
  title: "Delete Chat",
  message: `Delete "${title}" chat?\nThis cannot be undone.`,
  onConfirm: async () => {

    // ✅ FIX — modal 
    setConfirm(null);

    try {
      await API.delete(`/chat/${chatId}`, {
        withCredentials: true,
      });

      const updated = allChats.filter((chat) => chat._id !== chatId);
      setAllChats(updated);

      if (currentChatId === chatId) {
        setMessages([]);
        setCurrentChatId(null);
        sessionStorage.removeItem("currentChatId");
      }

      // ✅ SUCCESS TOAST
      showToast("Chat deleted successfully", "success");

    } catch (err) {
      console.log("Delete error:", err);

      // ❌ ERROR TOAST
      showToast("Failed to delete chat", "error");
    }
  }
},100);

};
  //empty//

  const isEmpty = messages.length === 0;

 
  return (
   <div
  className={`flex flex-col min-h-screen bg-[#0d0d0d] text-white ${
    sidebarOpen ? " overflow-hidden" : ""
  }`}
>
      {/* Navbar */}
     <header className="fixed top-0 left-0  w-full border-b border-gray-800 bg-[#0d0d0d] z-50
     rounded-b-3xl">
  <div className="w-full max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">

    {/* ✅ LEFT — LOGO + TITLE */}
    <div className="flex items-center gap-2 shrink-0">
      <img src="/Firefly.jpg" className="w-9 h-9 rounded-full" />
      <span className="font-bold text-lg hidden sm:block ">
        VR Doctor
      </span>
    </div>

    {/*  RIGHT — ACTION BUTTONS */}
   <div className="flex items-center gap-3 ml-auto">

  {/* ========================= */}
  {/* ⭐ REMAINING + PREMIUM */}
  {/* ========================= */}
 <div className="flex items-center gap-2">

  {/* ❌ ADMIN → hide remaining */}
  {user?.role !== "admin" && (
    <span className="text-xs bg-gray-800 px-3 py-1 rounded-full text-gray-300">
      {remaining === "∞" ? "Unlimited" : `${remaining}/5`}
    </span>
  )}

  {/* ✅ ADMIN / PREMIUM BADGE */}
  {(user?.isPremium || user?.role === "admin") && (
    <span className="text-xs bg-linear-to-r from-yellow-300 to-orange-400 text-black px-3 py-1 rounded-full font-semibold">
       {user.role === "admin" ? "Admin" : "Premium"}
    </span>
  )}

</div>

  {/* ========================= */}
  {/* NEW CHAT */}
  {/* ========================= */}
  <button
    onClick={handleNewChat}
    className="p-2 rounded-full hover:bg-gray-700 transition"
  >
    <FaPenToSquare size={21} />
  </button>

  {/* ========================= */}
  {/* MENU */}
  {/* ========================= */}
  <button
    onClick={() => setSidebarOpen(prev => !prev)}
    className="p-2 rounded-full hover:bg-gray-700 transition"
  >
    <FiMenu
      size={25}
      className={`transition-transform duration-400 ${
        sidebarOpen ? "rotate-90" : "rotate-0"
      }`}
    />
  </button>

</div>

  </div>
</header>
      {/* Sidebar Overlay */}
      {/* ================= OVERLAY ================= */}

<div
  onClick={() => {
    setSidebarOpen(false);
    setSearch("");
  }}
  className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 
  transition-all duration-300 ease-in-out
  ${
    sidebarOpen
      ? "opacity-100 visible pointer-events-auto"
      : "opacity-0 invisible pointer-events-none"
  }`}
/>

      {/* ================= SIDEBAR ================= */}
      <aside style={{ WebkitOverflowScrolling : "touch"}}
        className={`fixed top-0 left-0 h-full w-72 bg-[#111] border-r border-gray-800 z-50
      transform transition-all duration-500 ease-in-out will-change-transform rounded-tr-4xl
      rounded-br-4xl
      ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-gray-800
        bg-linear-to-r from-blue-600 to-indigo-700 rounded-tr-4xl ">
          <div className="flex items-center gap-2">
            <PiStethoscopeBold size={30} />
            <h2 className="font-bold text-xl">VR Doctor</h2>
          </div>

          <button onClick={() => setSidebarOpen(false)}
            className="text-gray-200 hover:text-white">✕</button>
        </div>

        {/* Search */}
        <div className="p-3">
          <input
            type="text"
            placeholder="Search chat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-gray-900 border border-gray-700"
          />
        </div>

        {/* New Chat */}
        <button
          onClick={handleNewChat}
          className="mx-3 py-3 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-700 
          send-btn transition"
        >
          New Chat
        </button> 

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto px-2 mt-2">
          {allChats
            .filter((chat) =>
              (chat.title || "New Chat")
                .toLowerCase()
                .includes(search.toLowerCase()),
            )
            .map((chat) => (
              <button
                key={chat._id}
                onClick={() => handleOpenChat(chat._id)}
             onMouseDown={() =>
  handleMouseDown(chat._id, chat.title || "New Chat")
}
onMouseUp={cancelLongPress}
onMouseLeave={cancelLongPress}

// ⭐ MOBILE SUPPORT
onTouchStart={() =>
  handleMouseDown(chat._id, chat.title || "New Chat")
}
onTouchEnd={cancelLongPress}
                className={`w-full text-left px-4 py-3 text-sm rounded-2xl mb-1 transition
              ${
                currentChatId === chat._id
                  ? "bg-gray-800"
                  : "hover:bg-gray-800 text-gray-300"
              }`}
              >
                💬 {highlightText(chat.title || "New Chat")}
              </button>
            ))}
        </div>

        {/* Profile */}
        <div className="p-3 border-t border-gray-800 space-y-2 rounded-t-xl">
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full py-3 rounded-2xl border border-gray-700 hover:bg-gray-800"
          >
            Dashboard
          </button>

          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-3 w-full py-2 px-3 rounded-2xl border border-gray-700 hover:bg-gray-800"
          >
 <img
src={
  user?.photo
    ? user.photo.replace("/upload/", "/upload/w_200,h_200,c_fill/")
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=111&color=fff`
}
  alt="profile"
  className="w-12 h-12 rounded-full object-cover object-center border border-gray-700"
/>
            <div>
              <p>{profile?.name || "User"}</p>
              <p className="text-xs text-gray-400">View Profile</p>
            </div>
          </button>

          <button
            onClick={handleLogout}
            className="w-full py-3 rounded-2xl border border-gray-700 hover:bg-gray-800"
          >
            Logout
          </button>
        </div>
      </aside>
      {/* ← SIDEBAR CLOSE */}

 {/* Chat area */}
<main
  onScroll={(e) => {
    const el = e.target;

    const isBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < 50;

    isAtBottomRef.current = isBottom;
  }}
  className={`flex-1 overflow-x-hidden pt-22 pb-26 sm:pb-24
  ${
    isEmpty
      ? "flex items-center justify-center"
      : "pb-24 flex flex-col"
  }`}
  style={{
    overflowY: sidebarOpen ? "hidden" : "auto",   // 🔥 scroll lock
    touchAction: sidebarOpen ? "none" : "auto",   // 🔥 mobile touch lock
  }}
>
       <div
  className={`w-full max-w-2xl sm:max-w-3xl mx-auto px-4 flex flex-col gap-4 min-h-full ${
    sidebarOpen ? "overflow-hidden" : ""
  }`}
>
          {isEmpty ? (
            <div className="flex flex-col  items-center gap-15 w-full px-4 ">
              <div className="text-center text-gray-400 pb-15  ">
                👋 Hi, I'm{" "}
                <span
                  className="text-blue-700 text-lg font-bold "
                  ref={typedRef}
                ></span>
              </div>

              {/*  CENTER INPUT */}
              <div className="w-full max-w-2xl pb-15  ">
                <div className="flex items-end gap-2 bg-gray-900 rounded-4xl px-2.5 py-1.5 shadow-l">
                  <textarea
                    rows="1"
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                    }}
                    onKeyDown={handleKeyPress}
                    placeholder="🔍Ask Symptoms..."
                    className="flex-1 bg-transparent outline-none text-white placeholder-gray-400 px-2 py-3 
                   leading-relaxed resize-none h-12  transition-all duration-400 overflow-y-auto break wrap-break-word scrollbar-hide"
                  />
                   <button
onClick={startVoice}
className="p-3 rounded-full hover:bg-gray-700 transition"
>
<FaMicrophone size={18}
className={`${isRecording ? "text-red-500 animate-pulse" : ""}`} />
</button>
                  <button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || loading}
                    className="bg-linear-to-r from-blue-600 to-indigo-600 send-btn disabled:bg-gray-600 px-3 py-3 rounded-full text-white font-medium transition shrink-0 "
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              ref={chatContainerRef}
              onClick={() => setActiveIndex(null)}
              className="flex flex-col gap-4"
            >
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  onMouseDown={() => handleHoldStart(idx)}
                  onMouseUp={handleHoldEnd}
                  onMouseLeave={handleHoldEnd}
                  onTouchStart={() => handleHoldStart(idx)}
                  onTouchEnd={handleHoldEnd}
                  onClick={(e) => e.stopPropagation()}
                  className={`relative select-none cursor-default bubble message-animate-[fadeIn_0.25s_ease-in-out] px-5 py-3 rounded-3xl max-w-[85%]
                 whitespace-pre-wrap wrap-break-word text- leading-relaxed shadow-md text-sm
  ${
   msg.sender === "user"
? "bg-linear-to-r from-blue-600 to-indigo-600 text-white self-end rounded-br-md"
: "bot-glass self-start bot-bubble rounded-bl-md "
  }`}
                >
   {msg.sender === "bot" ? (
  <div className="leading-relaxed whitespace-pre-wrap">
    {msg.text || ""}
  </div>
) : (
  msg.text || ""
)}
                  {/* Copy Button */}
                  {activeIndex === idx && (
                    <button
                      onClick={() => handleCopy(msg.text, idx)}
                      className="absolute -top-8 right-0 bg-gray-700 text-xs px-3 py-1 rounded-md"
                    >
                      {copiedIndex === idx ? "Copied " : "Copy"}
                    </button>
                  )}
                </div>
              ))}

             {loading && (
<div className=" text-gray-200 self-start rounded-3xl px-4 py-3 flex items-center gap-2">

<span className="ai-brain"></span>

<div className="typing">
<span></span>
<span></span>
<span></span>
</div>

<span className="text-sm text-gray-400">
Doctor is thinking...
</span>

</div>
)}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>
      {/* Input */}
      {!isEmpty && (
        <footer className="fixed bottom-0 left-0 w-full   bg-[#0d0d0d] z-30 backdrop-blur-md
         rounded-t-4xl ">
          <div className="max-w-3xl  lg:max-w-4xl xl:max-w-5xl mx-auto  sm:px-4 md:px-6
          pb-2.5 rounded-t-4xl">
            <div className="w-full flex items-center gap-2 bg-gray-900 rounded-full px-2.5 py-2 shadow-lg">
              <textarea
                rows="1"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                }}
                onKeyDown={handleKeyPress}
                placeholder="Ask a health question..."
               className="flex-1 bg-transparent outline-none text-white placeholder-gray-400 
            px-4 py-3 resize-none h-12  transition-all duration-500 scrollbar-hide leading-relaxed
            overflow-y-auto wrap-break-word whitespace-pre-wrap"
              />
   <button
onClick={startVoice}
className="p-3 rounded-full hover:bg-gray-700 transition"
>
<FaMicrophone size={18}
className={`${isRecording ? "text-red-500 animate-pulse" : ""}`}   />
</button>
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || loading}
                className="bg-linear-to-r from-blue-600 to-indigo-600 send-btn  disabled:bg-gray-600 px-3 py-3  
               shrink-0  rounded-full text-white font-medium transition "
              >
                Send
              </button>
            </div>
          </div>
        </footer>
      )}
      {/* ================= PREMIUM POPUP ================= */}
{showPremium && (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">

    <div className="bg-linear-to-br from-gray-900 to-gray-800 p-6 rounded-3xl w-[90%] max-w-sm text-center shadow-2xl border border-gray-700 animate-scaleUp">

      {/* ICON */}
      <div className="text-4xl mb-3"></div>

      {/* TITLE */}
      <h2 className="text-xl font-bold text-white mb-2">
        Upgrade to Premium
      </h2>

      {/* DESCRIPTION */}
      <p className="text-gray-400 text-sm mb-5">
        Unlock unlimited AI health chat & faster response
      </p>

      {/* FEATURES */}
      <div className="text-left text-sm text-gray-300 mb-5 space-y-2">
        <p> Unlimited Messages</p>
        <p> Faster VR Doctor</p>
        <p> Smart Diagnosis</p>
      </div>

      {/* PRICE */}
      <div className="text-2xl font-bold text-indigo-400 mb-4">
        ₹199 / month
      </div>

      {/* BUTTON */}
      <button
        onClick={handlePayment}
        className="bg-indigo-600 hover:bg-indigo-700 w-full py-3 rounded-xl text-white font-semibold transition active:scale-95"
      >
        Buy Now
      </button>

      {/* CANCEL */}
      <button
        onClick={() => setShowPremium(false)}
        className="mt-3 text-gray-400 text-sm hover:text-white"
      >
        Maybe later
      </button>

    </div>
  </div>
)}
    </div>
    
  );
}

export default Bot;      
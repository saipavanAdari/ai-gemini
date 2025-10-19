import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { userDataContext } from "../context/UserContext";
import aiImg from "../assets/ai.gif";
import userImg from "../assets/user.gif";
import { RiMenuUnfold4Line } from "react-icons/ri";
import { IoClose } from "react-icons/io5";


const Home = () => {
  const { userData ,logout } = useContext(userDataContext);
  const navigate = useNavigate();
  const [userText, setUserText] = useState("");
  const [aiText, setAiText] = useState("");
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false); // ✅ track speaking

  // ✅ Typing animation for AI
  useEffect(() => {
    if (!aiText) return;
    setIsTyping(true);
    setDisplayText("");
    let i = 0;

    const typingInterval = setInterval(() => {
      setDisplayText((prev) => prev + aiText[i]);
      i++;
      if (i >= aiText.length) {
        clearInterval(typingInterval);
        setIsTyping(false);
        // ✅ After AI finishes typing, show user again
        setTimeout(() => {
          setAiText("");
          setDisplayText("");
          setIsUserSpeaking(true);
        }, 1500);
      }
    }, 50);

    return () => clearInterval(typingInterval);
  }, [aiText]);

  const getImageSrc = (img) => {
    if (!img) return null;
    if (img.startsWith("http://") || img.startsWith("https://")) return img;
    if (img.startsWith("/public")) return `https://ai-gemini-pmfb.onrender.com${img}`;
    if (img.startsWith("/")) return img;
    return `https://ai-gemini-pmfb.onrender.com/public/${img}`;
  };

  const handleCustomize = () => navigate("/customize");
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const detectLanguage = (text) => {
    const telugu = /[\u0C00-\u0C7F]/;
    const hindi = /[\u0900-\u097F]/;
    if (telugu.test(text)) return "te-IN";
    if (hindi.test(text)) return "hi-IN";
    return "en-IN";
  };

  const getGeminiResponseWithLang = async (command, lang = "en-IN") => {
    try {
      const response = await fetch("https://ai-gemini-pmfb.onrender.com/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command,
          assistantName: userData.assistantName,
          userName: userData.name || "User",
          language: lang,
        }),
      });

      const data = await response.json();
      let textResponse = "";

      if (typeof data === "string") {
        const cleanData = data.replace(/```json|```/g, "").trim();
        try {
          const parsed = JSON.parse(cleanData);
          textResponse = parsed.response || parsed.text || "";
        } catch {
          textResponse = cleanData;
        }
      } else if (typeof data === "object") {
        textResponse = data.response || data.text || "";
      }

      return textResponse || "No response";
    } catch (error) {
      console.error("❌ Error in getGeminiResponseWithLang:", error);
      return "Error occurred";
    }
  };

  const speak = (text, lang = "en-IN") => {
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    const voices = window.speechSynthesis.getVoices();
    const selectedVoice = voices.find((v) => v.lang === lang);
    if (selectedVoice) utterance.voice = selectedVoice;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const handleCommand = (data) => {
    const { type, userInput, response, lang } = data;
    speak(response, lang);
    if (type === "ai-response") return;

    if (type === "google-search") {
      const query = userInput.replace(/google search/i, "").trim();
      const encodedQuery = encodeURIComponent(query);
      window.open(`https://www.google.com/search?q=${encodedQuery}`, "_blank");
    }
    if (type === "youtube-search") {
      const query = encodeURIComponent(userInput);
      window.open(
        `https://www.youtube.com/results?search_query=${query}`,
        "_blank"
      );
    }
    if (type === "instagram-open")
      window.open("https://www.instagram.com/", "_blank");
    if (type === "facebook-open")
      window.open("https://www.facebook.com/", "_blank");
    if (type === "games-open") window.open("https://poki.com/", "_blank");
    if (type === "whatsapp-open")
      window.open("https://web.whatsapp.com/", "_blank");
    if (type === "gmail") window.open("https://mail.google.com/", "_blank");
  };

  const detectCommandType = (transcript) => {
    const t = transcript.toLowerCase().trim();
    if (t.includes("google search")) return "google-search";
    if (t.includes("youtube")) return "youtube-search";
    if (t.includes("instagram")) return "instagram-open";
    if (t.includes("facebook")) return "facebook-open";
    if (t.includes("whatsapp")) return "whatsapp-open";
    if (t.includes("gmail") || t.includes("email")) return "gmail";
    if (t.includes("game")) return "games-open";
    if (t.includes("calculator")) return "calculator-open";
    return "ai-response";
  };

  // ✅ Speech recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("⚠️ SpeechRecognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "en-IN";

    recognition.onstart = () => setIsUserSpeaking(true);
    recognition.onend = () => setIsUserSpeaking(true); // back to user image idle

    recognition.onresult = async (event) => {
      const transcript =
        event.results[event.results.length - 1][0].transcript.trim();
      console.log("🎙️ Heard:", transcript);

      setUserText(transcript);
      const detectedLang = detectLanguage(transcript);

      if (
        userData?.assistantName &&
        transcript.toLowerCase().includes(userData.assistantName.toLowerCase())
      ) {
        setIsUserSpeaking(false); // switch to AI
        const responseText = await getGeminiResponseWithLang(
          transcript,
          detectedLang
        );
        setAiText(responseText);

        const type = detectCommandType(transcript);
        handleCommand({
          type,
          userInput: transcript,
          response: responseText,
          lang: detectedLang,
        });
      }
    };

    recognition.onerror = (error) =>
      console.error("🎤 Recognition error:", error);
    recognition.start();
    return () => recognition.stop();
  }, [userData]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex flex-col justify-center items-center px-4 sm:px-8 py-12 relative text-center overflow-hidden">
      {/* Menu Icon */}
      <RiMenuUnfold4Line
        className="absolute top-6 left-6 text-white text-3xl cursor-pointer z-50"
        onClick={() => setMenuOpen(!menuOpen)}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gray-800 bg-opacity-95 shadow-2xl flex flex-col items-center justify-start pt-20 space-y-6 transform transition-transform duration-300 z-40 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <IoClose
          className="absolute top-4 right-4 text-white text-3xl cursor-pointer"
          onClick={() => setMenuOpen(false)}
        />
        <button
          onClick={handleCustomize}
          className="w-[80%] h-[45px] text-black font-semibold bg-white rounded-full text-[15px] hover:bg-gray-200 transition"
        >
          Customize Assistant
        </button>
        <button
          onClick={handleLogout}
          className="w-[80%] h-[45px] text-black font-semibold bg-white rounded-full text-[15px] hover:bg-gray-200 transition"
        >
          Logout
        </button>
      </div>

      {/* Main */}
      <div
        className={`flex flex-col items-center justify-center transition-all duration-300 ${
          menuOpen ? "ml-64" : ""
        }`}
      >
        <div className="w-56 sm:w-72 h-72 sm:h-96 rounded-2xl overflow-hidden shadow-2xl bg-gray-800 flex justify-center items-center hover:scale-105 transition-transform duration-300 mt-20 sm:mt-0">
          {userData?.assistantImage ? (
            <img
              src={getImageSrc(userData.assistantImage)}
              alt={userData?.assistantName || "Assistant"}
              className="h-full w-full object-cover"
            />
          ) : (
            <p className="text-gray-400 text-center text-lg">No Image Found</p>
          )}
        </div>

        {userData?.assistantName && (
          <h1 className="mt-4 sm:mt-6 text-2xl sm:text-3xl font-bold text-white tracking-wide drop-shadow-md">
            I’m{" "}
            <span className="text-blue-400 font-semibold">
              {userData.assistantName}
            </span>
          </h1>
        )}

        {/* 🗣️ User or 🤖 AI Section */}
        <div className="mt-8 flex flex-col items-center justify-center gap-8 sm:gap-16 w-full">
          {isUserSpeaking && (
            <div className="relative flex flex-col items-center text-center">
              <img
                src={userImg}
                alt="User"
                className="w-28 sm:w-40 h-28 sm:h-40 rounded-full object-cover shadow-lg border-4 border-blue-500"
              />
              <p className="mt-2 text-white text-base sm:text-lg font-semibold">
                You
              </p>
            </div>
          )}

          {!isUserSpeaking && aiText && (
            <div className="relative flex flex-col items-center">
              <img
                src={aiImg}
                alt="AI Assistant"
                className="w-28 sm:w-40 h-28 sm:h-40 rounded-full object-cover shadow-lg border-4 border-purple-500"
              />
              <p className="mt-2 text-white text-base sm:text-lg font-semibold">
                {userData?.assistantName || "Assistant"}
              </p>
              <div className="mt-4 bg-gray-800 text-white p-3 rounded-2xl shadow-lg max-w-[90%] sm:max-w-[300px] text-sm sm:text-base">
                <p className="font-medium leading-relaxed">{displayText}</p>
                {isTyping && <span className="animate-pulse">|</span>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;

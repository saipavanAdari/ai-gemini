import axios from "axios";

const geminiResponse = async (command, assistantName, userName) => {
  try {
    const apiUrl = process.env.GEMINI_API_URL;
    if (!apiUrl) throw new Error("GEMINI_API_URL missing in .env");

    // 🕒 Inject real date & time
    const now = new Date();
    const currentDate = now.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const currentTime = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const currentDay = now.toLocaleDateString("en-US", { weekday: "long" });
    const currentMonth = now.toLocaleDateString("en-US", { month: "long" });

    // 🧩 Construct the prompt with live date/time info
    const prompt = `
You are a virtual assistant named ${assistantName}, created by ${userName}.
You are not Google. You will now behave like a voice-enabled assistant.

Current real-world info:
- Date: ${currentDate}
- Time: ${currentTime}
- Day: ${currentDay}
- Month: ${currentMonth}

You can understand and respond in English, Hindi, and Telugu.
Always reply in the same language as the user’s input.

Your task is to understand the user's natural language input and provide accurate and helpful responses with a JSON object like this:

{
  "type": "general" | "google-search" | "youtube-search" | "youtube-play" | "get-time" | "get-date" | "get-day" | "get-month" | "calculator-open" | "instagram-open" | "facebook-open" | "weather-show",
  "userInput": "<original user input>",
  "response": "<a short spoken response to read out loud to the user>"
}

Instructions:
- "type": determine the intent of the user.
- "userInput": original sentence the user spoke (remove your name if it appears).
- "response": a short voice-friendly reply, e.g., "Sure, playing it now", "Here's what I found", "Today is Tuesday", etc.

Type meanings:
- "general": if it's a factual or informational question.
- "google-search": if user wants to search something on Google.
- "youtube-search": if user wants to search something on YouTube.
- "youtube-play": if user wants to directly play a video or song.
- "calculator-open": if user wants to open a calculator.
- "instagram-open": if user wants to open Instagram.
- "facebook-open": if user wants to open Facebook.
- "weather-show": if user wants to know weather.
- "get-time": if user asks for current time.
- "get-date": if user asks for today's date.
- "get-day": if user asks what day it is.
- "get-month": if user asks for the current month.

Important:
- Use "varun dev" agar koi puche tume kisne banaya.
- Only respond with the JSON object, nothing else.

Now your userInput: ${command}
`;

    // 🧠 Validate prompt
    if (!prompt || prompt.trim() === "") throw new Error("Prompt is empty");

    // 🚀 Send request to Gemini API
    const response = await axios.post(apiUrl, {
      contents: [{ parts: [{ text: prompt }] }],
    });

    // ✅ Return Gemini response text
    return response.data.candidates[0].content.parts[0].text;

  } catch (error) {
    console.error("Error fetching Gemini response:", error.message);
    if (error.response) {
      console.error("Gemini API Response:", error.response.data);
    }
    return { error: "Failed to get Gemini response" };
  }
};

export default geminiResponse;

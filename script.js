// 👇 yahan api key paste ki hai variable ke andar open gemini ai se

const API_KEY = "AIzaSyBVqGpqUNxtTEpsyfors9mQOVqRQLdgXe8";
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

// ✅ DOM elements yaha html ke element access kiya hai  .....
const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");
const chatbotContainer = document.getElementById("chatbotContainer");
const voiceBtn = document.getElementById("voiceBtn");
const themeBtn = document.getElementById("themeBtn");
const colorPickerContainer = document.getElementById("colorPickerContainer");
const closeColorPicker = document.getElementById("closeColorPicker");
const applyColor = document.getElementById("applyColor");
const customColor = document.getElementById("customColor");
const colorOptions = document.querySelectorAll(".color-option");

// ✅ Current theme color
let currentThemeColor = "#6366f1";

// ✅ yahan user ka msg show karne  funcation banaya hai
function addUserMessage(message) {
  const msgDiv = document.createElement("div"); // yaha aik naya div create kiya hai
  msgDiv.className = "message user-message"; // yaha class add ki hai
  msgDiv.innerHTML = `                                   
        <div>${message}</div>
        <div class="message-time">${new Date().toLocaleTimeString()}</div>
    `; //  class ma innerhtml add ki hai
  chatMessages.appendChild(msgDiv); //yaha hum ne uper banay gay element  ko sturture ma  add kiya hai chat message wali id ke child ma
  chatMessages.scrollTop = chatMessages.scrollHeight; // yaha hum ne aik property use ki hai
}

// ✅ yahan bot ka msg show karne  funcation banaya hai
function addBotMessage(message) {
  const msgDiv = document.createElement("div"); // yaha aik naya div create kiya hai
  msgDiv.className = "message bot-message"; // yaha class add ki hai
  msgDiv.innerHTML = `
        <div>${message}</div>
        <div class="message-time">${new Date().toLocaleTimeString()}</div>
    `; //  class ma innerhtml add ki hai
  chatMessages.appendChild(msgDiv); //yaha hum ne uper banay gay element  ko sturture ma  add kiya hai chat message wali id ke child ma
  chatMessages.scrollTop = chatMessages.scrollHeight; // yaha hum ne aik property use ki hai

  speakMessage(message); // 🔊 Bot ka jawab ko boly ga bi voice ma
}

// ✅ Typing indicator show/hide       jab user koi message dega to ya typing... indicator dega jab tak aagy se bot reply na karde
function showTyping() {
  const typing = document.createElement("div");
  typing.className = "message bot-message typing-indicator";
  typing.id = "typing";
  typing.innerHTML = `
        <span>Typing</span>
        <div class="typing-dots">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;
  chatMessages.appendChild(typing);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
// jab reply aahy ga to ya  funcation  typing.. ko  hide kar dega

function hideTyping() {
  const typing = document.getElementById("typing");
  if (typing) typing.remove();
}

// ✅ yaha ab  Gemini API ko call karne   ka funcation hai

// 👇 Ye aik async function hai — iska matlab ye hai ke ye function asynchronous kaam karega (jaise API call),
// aur 'await' keyword iske andar use ho sakta hai.
async function sendMessage() {
  // 👇 'chatInput.value' se user ka likha hua message liya ja raha hai aur trim() se extra spaces hata diye gaye hain.
  const userMessage = chatInput.value.trim();

  // 👇 Agar user ne kuch likha hi nahi (empty message), to function yahan se return kar jaayega aur aage nahi chalega.
  if (userMessage === "") return;

  // 👇 Ye function user ka message chat UI mein dikhata hai (jo banda likh raha hai uska message bubble banata hai).
  addUserMessage(userMessage);

  // 👇 Input box ko khali kar diya jaata hai taake user naya message likh sake.
  chatInput.value = "";

  // 👇 Ye function screen par "typing..." ka indicator dikhata hai  jab tak bot ka reply nahi aata.
  showTyping();

  // 👇 Try-catch ka use error handle karne ke liye hota hai.
  // Agar beech mein koi error aata hai (jaise internet ka issue), to catch block chalega.
  try {
    // 👇 Yahan 'fetch()' ka use ho raha hai server (ya AI API) ko request bhejne ke liye.
    // Yeh await ke sath likha gaya hai, iska matlab JavaScript yahan rukegi jab tak response nahi aata,
    // lekin background mein dusra code freeze nahi hoga.
    const response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
      method: "POST", // 👈 API ko POST request bheji ja rahi hai (data send karne ke liye)
      headers: { "Content-Type": "application/json" }, // 👈 Bata rahe hain ke hum JSON format mein data bhej rahe hain
      body: JSON.stringify({
        // 👇 body mein user ka message JSON form mein send ho raha hai
        contents: [
          {
            parts: [{ text: userMessage }], // 👈 Ye API ke format ke mutabiq data bhej raha hai
          },
        ],
      }),
    });

    // 👇 Jab response aajata hai to use JSON format mein convert kar rahe hain.
    const data = await response.json();

    // 👇 Ab jab reply mil gaya, to "typing..." loader hata dete hain.
    hideTyping();

    // 👇 API ke response se bot ka reply nikaal rahe hain (agar mil gaya).
    // Agar reply na mile to default message "Kuch masla hua..." show karein.
    const botReply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Kuch masla hua, dobara try karein.";

    // 👇 Bot ka reply chat UI mein dikhane ke liye ye function use ho raha hai.
    addBotMessage(botReply);
  } catch (error) {
    // 👇 Agar koi error aata hai (API down ho, internet na ho, etc.)
    // to "typing..." loader hata dete hain.
    hideTyping();

    // 👇 Chat mein error message show kar dete hain.
    addBotMessage("❌ Error aagaya. Internet ya API key check karein.");

    // 👇 Console mein detailed error print kar dete hain (developer debugging ke liye).
    console.error("Error:", error);
  }
}

// ✅ Enter ya Send button pe message bhejna
sendBtn.addEventListener("click", sendMessage);
chatInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") sendMessage(); // yahan enter key selecet ki hai
});

// 🧠 Voice Input Setup (SpeechRecognition)
const SpeechRecognition = // yahan variable banaya hai
  window.SpeechRecognition || window.webkitSpeechRecognition; /// ya voice ko text ma convert karta hai ya SpeechRecognition ya latest speech api hai browser ka  or ya wala webkitSpeechRecognition chrome or purane browser ma use hota hai
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

if (recognition) {
  recognition.continuous = false; // ✅ Ek message par rok do
  recognition.lang = "en-US"; // ✅ Aap chahein to "ur-PK" ya en-US bhi kar sakte hain
  recognition.interimResults = false;

  // ✅ Voice start hone par button active dikhao
  recognition.onstart = () => {
    voiceBtn.classList.add("listening"); //voice start karen ga to ya class add hojaha gi
  };

  // ✅ Voice band hone par button normal karo
  recognition.onend = () => {
    voiceBtn.classList.remove("listening"); // or jab voice end hogi to class remove ho jahagi
  };

  // ✅ Jab voice se message mil jaye
  recognition.onresult = (event) => {
    // jab voice text maconvert hogi to trigger kar dega
    const transcript = event.results[0][0].transcript; // ya jo bi text aaha ga usko transcript variable ma store kare gi
    chatInput.value = transcript; // jo text mila isko chatinput ma send kardega
    sendMessage(); // direct send ho jaha ga msg
  };
}

// ✅ Voice button par click se mic start karo
voiceBtn.addEventListener("click", () => {
  if (recognition) {
    recognition.start();
  } else {
    alert("❌ Voice recognition supported nahi hai is browser mein."); // agar browser ya device support nahi kare to alert dega
  }
});

// 🔊 Voice Output (SpeechSynthesis)
function speakMessage(message) {
  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(message); // yaha hum jo bi reply aaha ga wo ya javascript ke object ki help se voice ma bi bole ga
    utterance.lang = "en-US"; // ✅ Aap chahein to "ur-PK" ya en-US bhi kar sakte hain
    //Ye ek JavaScript object hai jo ek "speech request" ko represent karta hai...
    speechSynthesis.speak(utterance); // jo bi is variable ma hai voice ma batao
  }
}
// ------VOICE AND SPEECH RECOGNITION FUNCTIONALITY END HERE-----///

// ------COLOR THEME PICKER FUNCTIONALITY START HERE-----///
// 🎨 Color Picker - Short Version

// Open/close color picker
themeBtn.addEventListener("click", () => {
  colorPickerContainer.classList.add("active");
  createOverlay();
});

closeColorPicker.addEventListener("click", closeColorPickerFunc);

// Create overlay
function createOverlay() {
  const overlay = document.createElement("div");
  overlay.className = "color-picker-overlay active";
  overlay.id = "colorPickerOverlay";
  document.body.appendChild(overlay);
  overlay.addEventListener("click", closeColorPickerFunc);
}

// Close color picker function
function closeColorPickerFunc() {
  colorPickerContainer.classList.remove("active");
  removeOverlay();
}

// Remove overlay
function removeOverlay() {
  const overlay = document.getElementById("colorPickerOverlay");
  overlay?.remove();
}

// Color option selection
colorOptions.forEach((option) => {
  option.addEventListener("click", () => {
    colorOptions.forEach((opt) => opt.classList.remove("active"));
    option.classList.add("active");
    customColor.value = option.dataset.color;
  });
});

// Custom color input
customColor.addEventListener("input", () => {
  colorOptions.forEach((opt) => opt.classList.remove("active"));
});

// Apply color theme
applyColor.addEventListener("click", () => {
  const selectedColor = customColor.value;
  applyTheme(selectedColor);
  closeColorPickerFunc();
  localStorage.setItem("chatbotTheme", selectedColor);
});

// Apply theme to all elements
function applyTheme(color) {
  currentThemeColor = color;

  // Update CSS variable
  document.documentElement.style.setProperty("--theme-color", color);

  // Create gradient color
  const gradientColor = `linear-gradient(135deg, ${color} 0%, ${adjustColor(
    color,
    20
  )} 100%)`;

  // Update elements
  document.querySelector(".chat-header").style.background = gradientColor;

  document
    .querySelectorAll(".btn, .feature, .apply-btn, .user-message")
    .forEach((el) => {
      el.style.background = gradientColor;
    });

  // Theme change message
  addBotMessage(`Theme changed to ${color}! 🎨`);
}

// Adjust color brightness
function adjustColor(color, percent) {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);

  const R = Math.min(255, Math.max(0, (num >> 16) + amt));
  const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt));
  const B = Math.min(255, Math.max(0, (num & 0x0000ff) + amt));

  return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

// Load saved theme
window.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("chatbotTheme");
  if (savedTheme) {
    applyTheme(savedTheme);
    customColor.value = savedTheme;
  }
});

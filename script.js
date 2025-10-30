// 👇 yahan api key paste ki hai variable ke andar open gemini ai se

const API_KEY = "AIzaSyBVqGpqUNxtTEpsyfors9mQOVqRQLdgXe8";
// ye variable me humne apni Gemini AI ki API key rakhi hai (authentication ke liye)

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
// ye Gemini AI model ka API endpoint URL hai jahan par hum request bhejenge

// ✅ DOM elements yaha html ke element access kiya hai  .....
const chatMessages = document.getElementById("chatMessages");
// ye chat ka main area hai jahan messages dikhte hain

const chatInput = document.getElementById("chatInput");
// ye input box hai jahan user message likhta hai

const sendBtn = document.getElementById("sendBtn");
// ye “Send” button hai jisko click karne par message bhejna hai

const chatbotContainer = document.getElementById("chatbotContainer");
// ye poora chatbot container element hai

const voiceBtn = document.getElementById("voiceBtn");
// ye mic button hai jo voice input ke liye use hota hai

const themeBtn = document.getElementById("themeBtn");
// ye theme change karne ka button hai

const colorPickerContainer = document.getElementById("colorPickerContainer");
// ye color picker ka box hai jo color select karne me madad karta hai

const closeColorPicker = document.getElementById("closeColorPicker");
// ye close karne wala button hai color picker ke andar

const applyColor = document.getElementById("applyColor");
// ye button color apply karne ke liye use hota hai

const customColor = document.getElementById("customColor");
// ye color picker input hai jahan user apna custom color likh sakta hai (hex code)

const colorOptions = document.querySelectorAll(".color-option");
// ye saare color buttons select karta hai (predefined color options)

// ✅ Current theme color
let currentThemeColor = "#6366f1";
// default theme color violet-blue rakha gaya hai

// ✅ yahan user ka msg show karne  funcation banaya hai
function addUserMessage(message) {
  const msgDiv = document.createElement("div");
  // aik naya div create kiya gaya jisme user ka message dikhayenge

  msgDiv.className = "message user-message";
  // message ke design ke liye class assign ki

  msgDiv.innerHTML = `                                   
        <div>${message}</div>
        <div class="message-time">${new Date().toLocaleTimeString()}</div>
    `;
  chatMessages.appendChild(msgDiv);
  // ye message chat area me add kar diya gaya

  chatMessages.scrollTop = chatMessages.scrollHeight;
  // scroll automatically latest message tak chala jata hai
}

// ✅ yahan bot ka msg show karne  funcation banaya hai
function addBotMessage(message) {
  const msgDiv = document.createElement("div");
  // naya div create kiya gaya bot ke reply ke liye

  msgDiv.className = "message bot-message";
  // bot ke liye alag style class lagai

  msgDiv.innerHTML = `
        <div>${message}</div>
        <div class="message-time">${new Date().toLocaleTimeString()}</div>
    `;
  chatMessages.appendChild(msgDiv);
  // message chat area me add kiya gaya

  chatMessages.scrollTop = chatMessages.scrollHeight;
  // scroll last message tak move kar diya

  speakMessage(message);
  // bot ke reply ko voice me bolne ke liye call kiya gaya
}

// ✅ Typing indicator show/hide
function showTyping() {
  const typing = document.createElement("div");
  // ek naya div banaya jo "Typing..." show karega

  typing.className = "message bot-message typing-indicator";
  // us div ko classes di gaya style aur design ke liye

  typing.id = "typing";
  // unique id di gayi taake baad me remove kar sakein

  typing.innerHTML = `
        <span>Typing</span>
        <div class="typing-dots">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;
  chatMessages.appendChild(typing);
  // typing dots chat area me show kar diye

  chatMessages.scrollTop = chatMessages.scrollHeight;
  // scroll latest line tak le gaya
}

function hideTyping() {
  const typing = document.getElementById("typing");
  // "typing" wala element select kiya
  if (typing) typing.remove();
  // agar element exist karta hai to use hata diya gaya
}

// ✅ yaha ab  Gemini API ko call karne   ka funcation hai
async function sendMessage() {
  const userMessage = chatInput.value.trim();
  // input box se user ka likha hua text liya aur extra spaces hata diye

  if (userMessage === "") return;
  // agar message khali hai to kuch na kare aur return kar jaye

  addUserMessage(userMessage);
  // user ke message ko UI me show kar diya

  chatInput.value = "";
  // input box ko khali kar diya taake naya likh sake

  showTyping();
  // jab tak bot ka reply nahi aata, typing dots show kar diye

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
      method: "POST",
      // API ko POST request bheji gayi

      headers: { "Content-Type": "application/json" },
      // bata rahe hain ke hum JSON format me data bhej rahe hain

      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: userMessage }],
            // API ke format ke hisaab se data bheja gaya
          },
        ],
      }),
    });

    const data = await response.json();
    // API ka response JSON me convert kiya gaya

    hideTyping();
    // typing indicator hata diya gaya kyunki ab reply mil gaya

    const botReply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Kuch masla hua, dobara try karein.";
    // agar API reply de to use show karo, warna error message dikhao

    addBotMessage(botReply);
    // bot ka reply UI me show kar diya
  } catch (error) {
    hideTyping();
    // error aane par typing indicator hata diya

    addBotMessage("❌ Error aagaya. Internet ya API key check karein.");
    // user ko error message dikha diya

    console.error("Error:", error);
    // developer ke liye console me error print kiya
  }
}

// ✅ Enter ya Send button pe message bhejna
sendBtn.addEventListener("click", sendMessage);
// send button click hone par sendMessage() call hota hai

chatInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") sendMessage();
  // enter key press hone par bhi sendMessage() call hota hai
});

// 🧠 Voice Input Setup (SpeechRecognition)
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
// ye browser ki voice recognition API access karta hai (Chrome ke liye webkit prefix lagta hai)

const recognition = SpeechRecognition ? new SpeechRecognition() : null;
// agar support available hai to naya recognition object banaya gaya, warna null rakha gaya

if (recognition) {
  recognition.continuous = false;
  // ek baar message sun kar stop kar dega

  recognition.lang = "en-US";
  // voice recognition ka language set kiya gaya (chahein to “ur-PK” bhi kar sakte ho)

  recognition.interimResults = false;
  // sirf final result chahiye, beech ke partial results nahi

  recognition.onstart = () => {
    voiceBtn.classList.add("listening");
    // mic button par active style lag jata hai jab recording start hoti hai
  };

  recognition.onend = () => {
    voiceBtn.classList.remove("listening");
    // mic button se active style remove ho jata hai jab recording khatam hoti hai
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    // voice se jo text mila usko variable me store kiya gaya

    chatInput.value = transcript;
    // text input box me daal diya gaya

    sendMessage();
    // aur message automatically send kar diya gaya
  };
}

// ✅ Voice button par click se mic start karo
voiceBtn.addEventListener("click", () => {
  if (recognition) {
    recognition.start();
    // agar recognition support karta hai to mic start ho jata hai
  } else {
    alert("❌ Voice recognition supported nahi hai is browser mein.");
    // agar browser support nahi karta to alert dikhata hai
  }
});

// 🔊 Voice Output (SpeechSynthesis)
function speakMessage(message) {
  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(message);
    // ye message ko speech me convert karta hai

    utterance.lang = "en-US";
    // speech ka language set kiya gaya

    speechSynthesis.speak(utterance);
    // browser ka speaker use karke message bolta hai
  }
}

// ------COLOR THEME PICKER FUNCTIONALITY START HERE-----///

// Open/close color picker
themeBtn.addEventListener("click", () => {
  colorPickerContainer.classList.add("active");
  // color picker box ko visible kar diya gaya

  createOverlay();
  // background overlay banayi gayi taake UX better lage
});

closeColorPicker.addEventListener("click", closeColorPickerFunc);
// close button click hone par color picker close ho jata hai

// Create overlay
function createOverlay() {
  const overlay = document.createElement("div");
  // overlay ke liye naya div banaya gaya

  overlay.className = "color-picker-overlay active";
  // overlay ke design ke liye class di gayi

  overlay.id = "colorPickerOverlay";
  // unique id set ki gayi

  document.body.appendChild(overlay);
  // overlay ko page ke body me add kiya gaya

  overlay.addEventListener("click", closeColorPickerFunc);
  // overlay click karne par color picker close ho jata hai
}

// Close color picker function
function closeColorPickerFunc() {
  colorPickerContainer.classList.remove("active");
  // color picker box ko hide kar diya gaya

  removeOverlay();
  // overlay bhi remove kar diya gaya
}

// Remove overlay
function removeOverlay() {
  const overlay = document.getElementById("colorPickerOverlay");
  // overlay element select kiya gaya
  overlay?.remove();
  // agar exist karta hai to remove kar diya gaya
}

// Color option selection
colorOptions.forEach((option) => {
  option.addEventListener("click", () => {
    colorOptions.forEach((opt) => opt.classList.remove("active"));
    // pehle sab options se "active" class hata do

    option.classList.add("active");
    // click kiya gaya option active kar do

    customColor.value = option.dataset.color;
    // aur uska color input box me set kar do
  });
});

// Custom color input
customColor.addEventListener("input", () => {
  colorOptions.forEach((opt) => opt.classList.remove("active"));
  // jab user manually color likhta hai to sab buttons inactive ho jate hain
});

// Apply color theme
applyColor.addEventListener("click", () => {
  const selectedColor = customColor.value;
  // selected color input se liya gaya

  applyTheme(selectedColor);
  // theme apply karne ka function call kiya

  closeColorPickerFunc();
  // picker close kar diya

  localStorage.setItem("chatbotTheme", selectedColor);
  // selected color ko browser storage me save kar diya
});

// Apply theme to all elements
function applyTheme(color) {
  currentThemeColor = color;
  // global variable me new color store kiya gaya

  document.documentElement.style.setProperty("--theme-color", color);
  // CSS variable update kiya gaya new color se

  const gradientColor = `linear-gradient(135deg, ${color} 0%, ${adjustColor(
    color,
    20
  )} 100%)`;
  // ek gradient banaya gaya base color se thoda bright version ke sath

  document.querySelector(".chat-header").style.background = gradientColor;
  // chat header par new gradient apply kiya

  document
    .querySelectorAll(".btn, .feature, .apply-btn, .user-message")
    .forEach((el) => {
      el.style.background = gradientColor;
      // buttons aur user message bubbles par bhi color apply kiya
    });

  addBotMessage(`Theme changed to ${color}! 🎨`);
  // bot user ko batata hai ke theme change ho gayi
}

// Adjust color brightness
function adjustColor(color, percent) {
  const num = parseInt(color.replace("#", ""), 16);
  // color code (# hata kar) number me convert kiya

  const amt = Math.round(2.55 * percent);
  // brightness adjust karne ke liye value nikaali

  const R = Math.min(255, Math.max(0, (num >> 16) + amt));
  const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt));
  const B = Math.min(255, Math.max(0, (num & 0x0000ff) + amt));
  // red, green, blue channels adjust kiye color ko thoda bright banane ke liye

  return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  // new hex color return kiya gaya
}

// Load saved theme
window.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("chatbotTheme");
  // local storage se saved color liya gaya

  if (savedTheme) {
    applyTheme(savedTheme);
    // agar color mila to theme apply kar di gayi

    customColor.value = savedTheme;
    // aur input box me bhi color show kar diya
  }
});

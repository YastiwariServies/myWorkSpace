const mainChatArea = document.getElementById("chatBox");
const queryInput = document.getElementById("queryInput");

const API_KEY = "AIzaSyAdZky-JNUezBPPupHovfAcHWZ1XzFjKk4";

fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`)
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));

// 1. Handle Enter Key
queryInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && queryInput.value.trim() !== "") {
    getResponseFromAI();
  }
});

async function getResponseFromAI() {
  const query = queryInput.value.trim();
  if (!query) return;

  // 2. Clear input immediately
  queryInput.value = "";

  // 3. Show USER message in chat (Crucial for UX)
  appendMessage(query, "user");

  // 4. API Configuration
  // ⚠️ IMPORTANT: Replace this with a valid Google Key starting with 'AIzaSy...'
  // Get one here: https://aistudio.google.com/app/apikey
  const API_KEY = "AIzaSyAdZky-JNUezBPPupHovfAcHWZ1XzFjKk4"; 
  const MODEL = "models/gemini-2.5-flash";
  
  // We use 'gemini-1.5-flash' as it is the current standard stable model.
  const AIURL = `https://generativelanguage.googleapis.com/v1beta/${MODEL}:generateContent?key=${API_KEY}`;

  try {
    const response = await fetch(AIURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: query }],
          },
        ],
      }),
    });

    const data = await response.json();

    // 5. Check for API Errors (Bad Request, Invalid Key, etc.)
    if (!response.ok) {
      console.error("API Error Response:", data); // Look at this log in Console!
      throw new Error(`API Error: ${data.error?.message || response.statusText}`);
    }

    // 6. Validate Response Structure
    if (
      !data.candidates ||
      !data.candidates[0]?.content?.parts?.[0]?.text
    ) {
      throw new Error("Empty AI response");
    }

    let responseData = data.candidates[0].content.parts[0].text;

    // 7. Format the text
    responseData = formatResponse(responseData);

    // 8. Show AI message
    appendMessage(responseData, "ai");

  } catch (error) {
    console.error("Fetch error:", error);
    appendMessage("⚠️ API Error: Check console for details (likely invalid Key).", "error");
  }
}

// --- Helper Functions ---

function appendMessage(text, sender) {
  let content = "";
  
  if (sender === "user") {
    content = `
      <div class="userChat">
                    <div class="avatar">
                        <i class="fa-solid fa-user-astronaut"></i>
                    </div>
                    <div class="message">
                        <p>${text}</p>
                    </div>
                </div>
    `;
  } else if (sender === "ai") {
    content = `
      <div class="aiReply" style="text-align: left; margin: 10px;">
         <div class="avatar"><i class="fa-solid fa-robot"></i></div>
         <div class="message">
           <p style="margin: 0;">${text}</p>
         </div>
      </div>
    `;
  } else if (sender === "error") {
     content = `
      <div class="aiReply error" style="color: red; margin: 10px;">
         <p>${text}</p>
      </div>
    `;
  }

  mainChatArea.insertAdjacentHTML("beforeend", content);
  mainChatArea.scrollTop = mainChatArea.scrollHeight;
}

function formatResponse(text) {
  if (!text) return "";

  return text
    // Escape basic HTML to prevent injection
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

    // Code blocks ```code```
    .replace(/```([\s\S]*?)```/g, (match, code) => {
      return `<pre class="code-block"><code>${code.trim()}</code></pre>`;
    })

    // Inline code `code`
    .replace(/`([^`]+)`/g, `<code class="inline-code">$1</code>`)

    // Headings ###, ##
    .replace(/^### (.*)$/gm, `<h4>$1</h4>`)
    .replace(/^## (.*)$/gm, `<h3>$1</h3>`)
    .replace(/^# (.*)$/gm, `<h2>$1</h2>`)

    // Bold **text**
    .replace(/\*\*(.*?)\*\*/g, `<strong>$1</strong>`)

    // Italic *text*
    .replace(/\*(.*?)\*/g, `<em>$1</em>`)

    // Bullet points (*, -, •)
    .replace(/^\s*[\*\-•]\s+(.*)$/gm, `<li>$1</li>`)
    .replace(/(<li>.*<\/li>)/gs, `<ul>$1</ul>`)

    // Numbered lists (1. 2. 3.)
    .replace(/^\s*\d+\.\s+(.*)$/gm, `<li>$1</li>`)
    .replace(/(<li>.*<\/li>)/gs, `<ol>$1</ol>`)

    // Paragraph breaks
    .replace(/\n{2,}/g, `</p><p>`)
    .replace(/\n/g, `<br>`)

    // Wrap plain text in <p>
    .replace(/^(.+)$/s, `<p>$1</p>`);
}


// ======================
// FIREBASE CONFIGURATION
// ======================

const firebaseApp = firebase.initializeApp({
    apiKey: "AIzaSyB11TmQdvLRJHi3kQwVP7kG2Yri9V_HDsg",
    authDomain: "attendxpress-cc490.firebaseapp.com",
    projectId: "attendxpress-cc490",
    storageBucket: "attendxpress-cc490.firebasestorage.app",
    messagingSenderId: "843128829207",
    appId: "1:843128829207:web:6df9fc0f333d246b6f3352",
    measurementId: "G-XX1485JMHK"
});

// Firestore and Auth references
const db = firebaseApp.firestore();
const auth = firebaseApp.auth();

// ======================
// FETCH TODO LIST
// ======================

// 1. Handle Enter Key
// document.getElementById("todoInput").addEventListener("keydown", function (e) {
//   if (e.key === "Enter") {
//     addTodoList();
//   }
// });

const getTodoList = () => {
    const todoUL = document.getElementById("todoUL");
    todoUL.innerHTML = ""; // Clear existing list to avoid duplicates

    db.collection('todoList')
        .orderBy("timestamp", "asc")
        .get()
        .then((snapshot) => {
            const todos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            todos.forEach(todo => {
                const contentCode = `
                    <li>
                        <input type="checkbox" ${todo.todoStatus === "complete" ? "checked" : ""} onchange="toggleTodoStatus('${todo.id}', this)">
                        <p>${todo.todoText}</p>
                        <div class="deleteBtn" onclick="deleteTODO('${todo.id}')">
                            <i class="fa-solid fa-trash"></i>
                        </div>
                    </li>
                `;
                todoUL.insertAdjacentHTML('beforeend', contentCode);
            });
        })
        .catch(error => {
            console.error("Error fetching todo list:", error);
        });
};

// Initial fetch
getTodoList();

// ======================
// ADD TODO ITEM
// ======================

const addTodoList = () => {
    const todoInput = document.getElementById("todoInput");
    const text = todoInput.value.trim();

    if (!text) return; // Don't add empty todos

    db.collection('todoList')
        .add({
            todoText: text,
            todoStatus: "incomplete",
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            todoInput.value = ""; // Clear input
            $("#addTodoList").toggleClass("none"); // Keep your existing toggle
            getTodoList(); // Refresh list
        })
        .catch(error => {
            console.error("Error adding todo:", error);
        });
};

// ======================
// DELETE TODO ITEM
// ======================

const deleteTODO = (id) => {
    db.collection('todoList')
        .doc(id)
        .delete()
        .then(() => {
            getTodoList(); // Refresh list after deletion
        })
        .catch(error => {
            console.error("Error deleting todo:", error);
        });
};

// ======================
// TOGGLE TODO STATUS
// ======================

const toggleTodoStatus = (id, checkbox) => {
    const status = checkbox.checked ? "complete" : "incomplete";

    db.collection('todoList')
        .doc(id)
        .update({ todoStatus: status })
        .catch(error => {
            console.error("Error updating todo status:", error);
            // Revert checkbox if update fails
            checkbox.checked = !checkbox.checked;
        });
};


// Scroll UP by 20px
document.querySelectorAll(".scroll20pxTop").forEach(button => {
    button.addEventListener("click", () => {
        const parent = button.parentElement;
        // parent.scrollTop -= 60;
        parent.scrollBy({ top: -200, behavior: "smooth" });
    });
});

// Scroll DOWN by 20px
document.querySelectorAll(".scroll20pxBottom").forEach(button => {
    button.addEventListener("click", () => {
        const parent = button.parentElement;
        // parent.scrollTop += 60;
        parent.scrollBy({ top: 200, behavior: "smooth" });
    });
});
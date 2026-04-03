<div align="center">

<img src="https://img.shields.io/badge/Day-11%20%2F%2030-6e41e2?style=for-the-badge&logo=calendar&logoColor=white" />
<img src="https://img.shields.io/badge/Multiple_AI_Providers-6e41e2?style=for-the-badge&logo=openai&logoColor=white" />
<img src="https://img.shields.io/badge/Local_Memory-6e41e2?style=for-the-badge&logo=databricks&logoColor=white" />
<img src="https://img.shields.io/badge/Deployed-Vercel-black?style=for-the-badge&logo=vercel&logoColor=white" />

<br /><br />

# 🤖 AI Chatbot

### A premium, ultra-fast AI Chat web application supporting multiple models (Groq, OpenAI, Gemini) completely in the browser.

<br/>

[![🚀 Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-ai--chatbot--30in30-6e41e2?style=for-the-badge)](https://ai-chatbot-30in30.vercel.app/)
&nbsp;&nbsp;
[![GitHub](https://img.shields.io/badge/⭐%20GitHub-Granth2006-24292e?style=for-the-badge&logo=github)](https://github.com/Granth2006)

</div>

---

## ⚙️ Features

<table>
  <tr>
    <td width="50%">
      <h3>🤖 Multi-Model Support</h3>
      Effortlessly switch between top-tier AI providers including Groq APIs, OpenAI (GPT-4), and Google Gemini straight from the settings menu.
    </td>
    <td width="50%">
      <h3>🧠 Persistent Memory</h3>
      Full session history is tracked and saved locally. Return anytime and your conversations will be waiting securely in your browser's localStorage.
    </td>
  </tr>
  <tr>
    <td>
      <h3>🎨 Premium Glassmorphic UI</h3>
      A cutting-edge dual light/dark mode interface packed with fluid animations, syntax highlighting, styled markdown formatting, and responsive glass designs.
    </td>
    <td>
      <h3>⚙️ Custom Context Menus</h3>
      Right click chats natively to rename or delete conversations instantly. Export conversations into standalone text files to maintain a physical backup.
    </td>
  </tr>
</table>

---

## 🔐 Privacy First

> **Your API keys remain secure in your browser.**
> The API requests are orchestrated directly from the client. The only servers touched are those operated by the LLM providers themselves (Groq, OpenAI, Google). Your data is exclusively housed in your browser's `localStorage` until you manually clear or delete it.

---

## 🧰 Tech Stack

| Technology | Purpose |
|---|---|
| ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white) | Structure & markup |
| ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white) | Premium styling, glassmorphism, responsive grids |
| ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black) | Session memory, DOM manipulation, ES6 Module API fetch architecture |
| `Marked.js / Highlight.js` | Rendering AI responses from markdown code strings with exact syntax highlights |
| ![Vercel](https://img.shields.io/badge/Vercel-000?style=flat&logo=vercel&logoColor=white) | Global deployment network |

---

## 📋 Project Info

| | |
|---|---|
| 🏆 **Challenge** | 30 Web Apps in 30 Days |
| 📅 **Day** | Day 11 / 30 |
| 👤 **Author** | Granth |
| 🌐 **Live URL** | [https://ai-chatbot-30in30.vercel.app/](https://ai-chatbot-30in30.vercel.app/) |
| 🛠️ **Build** | No build step — pure HTML / CSS / JS |
| 📄 **License** | MIT |

---

<details>
<summary>📁 File Structure</summary>

```
11/
├── index.html     # Structural template with Markdown integration & UI Modals
├── app.js         # Core Event coordination, DOM manipulators & rendering engines
├── api.js         # Abstraction bridging app settings with API Network calls
├── config.js      # System configurations mapping providers to specific URLs/Models
├── storage.js     # Wrappers for native window localStorage API 
└── style.css      # Design token system, fluid animations & Dark/Light variables
```

</details>

---

<div align="center">

Built by **[Granth](https://github.com/Granth2006)** &nbsp;·&nbsp; Part of the **30 Web Apps in 30 Days** challenge

[![Live Demo](https://img.shields.io/badge/🚀%20Open%20Live%20Demo-6e41e2?style=for-the-badge)](https://ai-chatbot-30in30.vercel.app/)

</div>

// Constants 
const API_BASE = "https://phi-lab-server.vercel.app/api/v1/lab";
const CREDENTIALS = { username: "admin", password: "admin123" };

// State 
let allIssues = [];
let activeTab = "all";

// DOM Helpers 
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// Pages 
function showPage(pageId) {
  $$(".page").forEach((p) => p.classList.add("hidden"));
  $(`#${pageId}`).classList.remove("hidden");
}

// Login 
function initLogin() {
  $("#loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const username = $("#username").value.trim();
    const password = $("#password").value.trim();
    const errorEl = $("#loginError");

    if (username === CREDENTIALS.username && password === CREDENTIALS.password) {
      errorEl.classList.add("hidden");
      showPage("mainPage");
      loadIssues();
    } else {
      errorEl.textContent = "Invalid credentials. Try admin / admin123";
      errorEl.classList.remove("hidden");
    }
  });
}

// Init 
document.addEventListener("DOMContentLoaded", () => {
  initLogin();
  initTabs();
  initSearch();
  initModal();
});

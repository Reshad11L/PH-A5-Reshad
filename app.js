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

// API 
async function fetchIssues() {
  const res = await fetch(`${API_BASE}/issues`);
  const json = await res.json();
  return json.data || [];
}

async function fetchSingleIssue(id) {
  const res = await fetch(`${API_BASE}/issue/${id}`);
  const json = await res.json();
  return json.data || null;
}

async function searchIssues(query) {
  const res = await fetch(`${API_BASE}/issues/search?q=${encodeURIComponent(query)}`);
  const json = await res.json();
  return json.data || [];
}

// Loading Spinner 
function showSpinner() {
  $("#spinner").classList.remove("hidden");
  $("#issuesGrid").classList.add("hidden");
  $("#emptyState").classList.add("hidden");
}

function hideSpinner() {
  $("#spinner").classList.add("hidden");
  $("#issuesGrid").classList.remove("hidden");
}

// Load & Render Issues 
async function loadIssues() {
  showSpinner();
  try {
    allIssues = await fetchIssues();
    renderIssues(allIssues);
    updateStats(allIssues);
  } catch (err) {
    console.error("Failed to load issues", err);
  } finally {
    hideSpinner();
  }
}

function filterByTab(issues, tab) {
  if (tab === "open") return issues.filter((i) => i.status === "open");
  if (tab === "closed") return issues.filter((i) => i.status === "closed");
  return issues;
}

function updateStats(issues) {
  const displayed = filterByTab(issues, activeTab);
  const openCount = issues.filter((i) => i.status === "open").length;
  const closedCount = issues.filter((i) => i.status === "closed").length;

  $("#issueCount").textContent = `${displayed.length} Issues`;
  $("#openCount").textContent = openCount;
  $("#closedCount").textContent = closedCount;
}

function getLabelStyle(label) {
  const styles = {
    bug: "bg-red-100 text-red-700 border border-red-200",
    enhancement: "bg-green-100 text-green-700 border border-green-200",
    documentation: "bg-blue-100 text-blue-700 border border-blue-200",
    "help wanted": "bg-yellow-100 text-yellow-700 border border-yellow-200",
    "good first issue": "bg-purple-100 text-purple-700 border border-purple-200",
  };
  return styles[label.toLowerCase()] || "bg-gray-100 text-gray-600 border border-gray-200";
}

function getLabelIcon(label) {
  const icons = {
    bug: '<i class="fa-solid fa-bug"></i>',
    enhancement: '<i class="fa-solid fa-wand-magic-sparkles"></i>',
    documentation: '<i class="fa-solid fa-file-lines"></i>',
    "help wanted": '<i class="fa-solid fa-hand-holding-heart"></i>',
    "good first issue": '<i class="fa-solid fa-seedling"></i>',
  };
  return icons[label.toLowerCase()] || '<i class="fa-solid fa-tag"></i>';
}

function getPriorityStyle(priority) {
  const styles = {
    high: "bg-red-100 text-red-600",
    medium: "bg-yellow-100 text-yellow-600",
    low: "bg-gray-100 text-gray-500",
  };
  return styles[priority?.toLowerCase()] || "bg-gray-100 text-gray-500";
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" });
}

function createCard(issue) {
  const isOpen = issue.status === "open";
  const borderColor = isOpen ? "border-t-green-500" : "border-t-purple-500";
  const statusIcon = isOpen
    ? `<i class="fa-solid fa-circle-dot text-green-500 text-lg"></i>`
    : `<i class="fa-solid fa-circle-check text-purple-500 text-lg"></i>`;

  const labelsHtml = issue.labels
    .map(
      (l) =>
        `<span class="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${getLabelStyle(l)}">
          <span>${getLabelIcon(l)}</span> ${l.toUpperCase()}
        </span>`
    )
    .join("");

  const card = document.createElement("div");
  card.className = `bg-white rounded-xl border border-gray-200 border-t-4 ${borderColor} shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col p-4 gap-3 group`;
  card.innerHTML = `
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">${statusIcon}</div>
      <span class="text-xs font-semibold px-2.5 py-1 rounded-full ${getPriorityStyle(issue.priority)}">${(issue.priority || "").toUpperCase()}</span>
    </div>
    <div>
      <h3 class="font-semibold text-gray-900 text-sm leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">${issue.title}</h3>
      <p class="text-gray-500 text-xs mt-1 line-clamp-2">${issue.description}</p>
    </div>
    <div class="flex flex-wrap gap-1.5">${labelsHtml}</div>
    <div class="mt-auto pt-2 border-t border-gray-100 flex flex-col gap-0.5">
      <span class="text-xs text-gray-400">#${issue.id} by <span class="text-gray-600 font-medium">${issue.author}</span></span>
      <span class="text-xs text-gray-400">${formatDate(issue.createdAt)}</span>
    </div>
  `;

  card.addEventListener("click", () => openModal(issue.id));
  return card;
}

function renderIssues(issues) {
  const filtered = filterByTab(issues, activeTab);
  const grid = $("#issuesGrid");
  grid.innerHTML = "";

  updateStats(issues);

  if (filtered.length === 0) {
    grid.classList.add("hidden");
    $("#emptyState").classList.remove("hidden");
    return;
  }

  $("#emptyState").classList.add("hidden");
  grid.classList.remove("hidden");
  filtered.forEach((issue) => grid.appendChild(createCard(issue)));
}

// Tabs 
function initTabs() {
  $$(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeTab = btn.dataset.tab;
      $$(".tab-btn").forEach((b) => {
        b.classList.remove("bg-indigo-600", "text-white", "shadow-sm");
        b.classList.add("text-gray-500", "hover:text-gray-700");
      });
      btn.classList.add("bg-indigo-600", "text-white", "shadow-sm");
      btn.classList.remove("text-gray-500", "hover:text-gray-700");
      renderIssues(allIssues);
    });
  });
}

// Search 
function initSearch() {
  let debounceTimer;

  async function doSearch(query) {
    if (!query.trim()) {
      renderIssues(allIssues);
      return;
    }
    showSpinner();
    try {
      const results = await searchIssues(query);
      allIssues = results;
      renderIssues(results);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      hideSpinner();
    }
  }

  $("#searchInput").addEventListener("input", (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => doSearch(e.target.value), 400);
  });

  $("#searchBtn").addEventListener("click", () => {
    doSearch($("#searchInput").value);
  });

  $("#searchInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") doSearch(e.target.value);
  });

  // Reset search when cleared
  $("#searchInput").addEventListener("input", (e) => {
    if (!e.target.value.trim()) {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(async () => {
        showSpinner();
        allIssues = await fetchIssues();
        renderIssues(allIssues);
        hideSpinner();
      }, 300);
    }
  });
}

// Modal 
async function openModal(id) {
  const modal = $("#modal");
  const modalBody = $("#modalBody");
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  modalBody.innerHTML = `<div class="flex justify-center py-8"><div class="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>`;

  try {
    const issue = await fetchSingleIssue(id);
    if (!issue) throw new Error("Not found");

    const isOpen = issue.status === "open";
    const statusBadge = isOpen
      ? `<span class="inline-flex items-center gap-1.5 text-sm font-semibold bg-green-500 text-white px-3 py-1 rounded-full">
          <span class="w-2 h-2 bg-white rounded-full"></span> Opened
        </span>`
      : `<span class="inline-flex items-center gap-1.5 text-sm font-semibold bg-purple-500 text-white px-3 py-1 rounded-full">
          <span class="w-2 h-2 bg-white rounded-full"></span> Closed
        </span>`;

    const labelsHtml = issue.labels
      .map(
        (l) =>
          `<span class="inline-flex items-center gap-1 text-sm px-3 py-1 rounded-full font-medium ${getLabelStyle(l)}">
            <span>${getLabelIcon(l)}</span> ${l.toUpperCase()}
          </span>`
      )
      .join("");

    modalBody.innerHTML = `
      <div class="flex items-start justify-between gap-4 mb-4">
        <h2 class="text-xl font-bold text-gray-900 leading-snug">${issue.title}</h2>
      </div>
      <div class="flex flex-wrap items-center gap-3 mb-4">
        ${statusBadge}
        <span class="text-sm text-gray-500">•</span>
        <span class="text-sm text-gray-500">Opened by <strong class="text-gray-700">${issue.author}</strong></span>
        <span class="text-sm text-gray-500">•</span>
        <span class="text-sm text-gray-500">${formatDate(issue.createdAt)}</span>
      </div>
      <div class="flex flex-wrap gap-2 mb-5">${labelsHtml}</div>
      <p class="text-gray-600 text-sm leading-relaxed mb-6 bg-gray-50 rounded-lg p-4">${issue.description}</p>
      <div class="grid grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4">
        <div>
          <p class="text-xs text-gray-400 uppercase tracking-wide mb-1">Assignee</p>
          <p class="font-semibold text-gray-800">${issue.assignee || "Unassigned"}</p>
        </div>
        <div>
          <p class="text-xs text-gray-400 uppercase tracking-wide mb-1">Priority</p>
          <span class="inline-block text-sm font-bold px-3 py-1 rounded-full ${getPriorityStyle(issue.priority)}">${(issue.priority || "").toUpperCase()}</span>
        </div>
      </div>
    `;
  } catch (err) {
    modalBody.innerHTML = `<p class="text-red-500 text-center py-8">Failed to load issue details.</p>`;
  }
}

function closeModal() {
  const modal = $("#modal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

function initModal() {
  $("#closeModal").addEventListener("click", closeModal);
  $("#modal").addEventListener("click", (e) => {
    if (e.target === $("#modal")) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}

// Init 
document.addEventListener("DOMContentLoaded", () => {
  initLogin();
  initTabs();
  initSearch();
  initModal();
});

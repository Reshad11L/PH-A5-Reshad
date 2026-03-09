// Constants 
const API_BASE = "https://phi-lab-server.vercel.app/api/v1/lab";
const CREDENTIALS = { username: "admin", password: "admin123" };

// State 
let allIssues = [];
let activeTab = "all";

// DOM Helpers 
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

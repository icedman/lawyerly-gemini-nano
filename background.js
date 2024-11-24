// background.js
chrome.runtime.onInstalled.addListener(function () {
  console.log("Simple Extension Installed");
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log("Background script received message:", request);
  // You can add any background-related logic here if needed
});

// Additional background script logic can be added as needed

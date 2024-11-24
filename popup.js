// popup.js
document
  .getElementById("summarizeArticle")
  .addEventListener("click", function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      console.log("Button clicked. Sending message...");
      chrome.tabs.sendMessage(tabs[0].id, { action: "summarizeArticle" });
    });
  });

function formatData(data, p) {
  let res = '';
  let lines = [];
  let _p = p.toLowerCase();
  lines = data.split('\n');
  lines.forEach((l) => {
    l = l.trim();

    l = l.replace('**FACTS**', '');
    l = l.replace('**ISSUES**', '');
    l = l.replace('**RULING**', '');
    l = l.replace('**PRINCIPLES**', '');

    l = l.replace('## FACTS', '');
    l = l.replace('## ISSUES', '');
    l = l.replace('## RULING', '');
    l = l.replace('## PRINCIPLES', '');

    // let _l = l.toLowerCase();
    // if ((_l.includes(`##`) || _l.includes(`**`)) && _l.includes(_p)) {
    // //   res += '<h2 class="has-text-weight-semibold">' + l.toUpperCase() + '</h2>';
    //   return;
    // }

    res += '<p>' + l + '</p>';
  });

  res += '<br/><br/>';
  return res;
}

// popup.js
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log("Message received in popup:", msg);
  // Optionally send a response back
  // sendResponse({ status: "Message received!" });

  let target = msg.target ?? "output";
  let content = formatData(msg.data, target);
  if (msg.target) {
    content = `<h2 class="has-text-weight-semibold">${target.replace('output-', '').toUpperCase()}</h2>${content}`
  }
  result = document.getElementById(target);
  result.innerHTML = content;

  message = document.getElementById("message");
  message.innerHTML = "";

  if (msg.data == "Summarizing...") {
    document.getElementById("summarizeArticle").style = "display: none";
  } else {
    result.style = "text-align: left";
  }
});

setTimeout(() => {
  aiReady = "ai.summarizer is ready";
  if (!ai || !ai.summarizer) {
    aiReady = "ai.summarizer is not available";
  }
  message = document.getElementById("message");
  message.innerHTML = aiReady;
}, 250);

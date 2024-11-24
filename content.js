console.log("Content script loaded.");

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log("Content script received message:", request);
  if (request.action === "summarizeArticle") {
    summarizeArticle();
  }
});

function showResult(result, target) {
  console.log(result);
  chrome.runtime.sendMessage(
    { action: "summary", data: result, target: target },
    (response) => {
      // console.log("Response from popup:", response);
    },
  );
}

function makeUnique(nodeList) {
  // Convert NodeList to an array and filter out duplicates based on dataset.id
  const uniqueNodes = Array.from(nodeList).filter((node, index, self) => {
    return index === self.findIndex((n) => n.dataset.id === node.dataset.id);
  });
  return uniqueNodes.sort((a, b) => (a.offsetTop < b.offsetTop ? -1 : 1));
}

const callPrompt = async (session, p) => {
  let quotes = "";
  annots = makeUnique(document.querySelectorAll(`.annot8-hl-${p}`));
  if (annots.length) {
    quotes += `\n\n${p.toUpperCase()}\n\n`;
  }
  annots.forEach((a) => {
    if (a.dataset.quote) {
      quotes += a.dataset.quote + "\n";
    }
  });

  if (!quotes.trim()) {
    return;
  }

  try {
    showResult('thinking...', `output-${p}`);
    let prompt = `grammatically format and summarize this text, without expanding or explaining: ${quotes}`;
    let res = await session.prompt(prompt);
    showResult(res, `output-${p}`);
    showResult('');
  } catch (err) {
    showResult(`${err}`, `output-${p}`);
  }

  // showResult('');
  // let prompt = `format the ${p} from this text without expanding: ${quotes}`;
  // session.prompt(prompt).then((res) => {
  //   showResult(res, `output-${p}`);
  // }).catch((err) => {
  //   showResult(`${err}`);
  // });
};

async function generateDigest(sum, annotations) {
  // let quotes = "";
  let parts = ["facts", "issues", "ruling", "principles"];

  let session = await ai.languageModel.create({
    systemPrompt:
      "you are a law student formatting a case digest from annotations as verbatim as possible",
  });

  for (let i = 0; i < parts.length; i++) {
    await callPrompt(session, parts[i]);
  }
}

function summarizeDigest() {
  const article = document.querySelector("article.digest");
  console.log(article);

  if (!article) {
    console.log("No digest element found on this page.");
    return;
  }

  if (!ai || !ai.summarizer) {
    alert("AI (gemini nano) is not available.");
    return;
  }

  ai.summarizer
    .capabilities()
    .then((res) => {
      if (res.available !== "readily") {
        console.log("AI summarizer is not readily available.");
        return;
      }

      console.log("Summarizing...");
      showResult("Summarizing...");
      ai.summarizer
        .create()
        .then(async (sum) => {
          let res = await sum.summarize(article.textContent);
          showResult(result);
        })
        .catch((err) => {
          console.error("Error creating summarizer:", err);
          showResult(`${err}`);
        });
    })
    .catch((err) => {
      console.error("Error checking summarizer capabilities:", err);
    });
}

function summarizeAnnotations() {
  const article = document.querySelector("article");
  if (!article) {
    console.log("No article element found on this page.");
    return;
  }

  if (!ai || !ai.summarizer) {
    alert("AI (gemini nano) is not available.");
    return;
  }

  const annotations = document.querySelectorAll(".annot8-hl");
  if (!annotations.length) {
    alert("This document has no annotations.");
    return;
  }

  ai.summarizer
    .capabilities()
    .then((res) => {
      if (res.available !== "readily") {
        console.log("AI summarizer is not readily available.");
        return;
      }

      console.log("Summarizing...");
      showResult("Summarizing...");
      ai.summarizer
        .create()
        .then((sum) => {
          generateDigest(sum, annotations);
        })
        .catch((err) => {
          console.error("Error creating summarizer:", err);
        });
    })
    .catch((err) => {
      console.error("Error checking summarizer capabilities:", err);
    });
}

function summarizeArticle(msg, sender, sendResponse) {
  const article = document.querySelector("article.digest");
  if (article) {
    summarizeDigest();
    return;
  }
  summarizeAnnotations();
}

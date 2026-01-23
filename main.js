let index = 0;

fetch("content.json")
  .then(res => res.json())
  .then(data => {
    entries = data;
  });

document.getElementById("changer").addEventListener("click", () => {
  if (!entries.length) return;

  index = (index + 1) % entries.length;
  document.getElementById("title").textContent = entries[index].title;
  document.getElementById("text").textContent = entries[index].text;
});
let lastClickTime = 0;
const DOUBLE_CLICK_DELAY = 350; 

const img = document.getElementById("changer");

img.addEventListener("click", () => {
  const now = Date.now();

  if (now - lastClickTime < DOUBLE_CLICK_DELAY) {
    window.location.href = "offer.html";
    return;
  }

  lastClickTime = now;

  index = (index + 1) % window.entries.length;
  titleEl.textContent = window.entries[index].title;
  textEl.textContent = window.entries[index].text;
});

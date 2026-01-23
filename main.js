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

const historyList = document.getElementById("historyList");

const search = document.getElementById("search");

let allHistory = [];

async function render(data) {
  historyList.innerHTML = "";

  data.forEach((item) => {
    const card = document.createElement("div");

    card.className = "card";

    card.innerHTML = `

<h3>${item.summary}</h3>

<p>

${item.readingTime}

</p>

<button class="favorite">

${item.favorite ? "⭐" : "☆"}

</button>

<button class="delete">

Delete

</button>

`;

    card.querySelector(".favorite").onclick = async () => {
      await toggleFavorite(item.id);

      load();
    };

    card.querySelector(".delete").onclick = async () => {
      await deleteSummary(item.id);

      load();
    };

    historyList.appendChild(card);
  });
}

async function load() {
  allHistory = await getHistory();

  render(allHistory);
}

search.addEventListener("input", () => {
  const value = search.value.toLowerCase();

  render(
    allHistory.filter((item) => item.summary.toLowerCase().includes(value)),
  );
});

load();

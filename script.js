// Builds the July & August daily reading checklists for Yagel and Amiad,
// with checked state saved in the browser (localStorage) so it persists.

const DAYS_IN_MONTH = { july: 31, august: 31 };

function storageKey(person, month, day) {
  return `reading-${person}-${month}-${day}`;
}

document.querySelectorAll(".days").forEach((container) => {
  const { person, month } = container.dataset;
  const total = DAYS_IN_MONTH[month];

  for (let day = 1; day <= total; day++) {
    const cell = document.createElement("div");
    cell.className = "day";
    cell.textContent = day;

    const key = storageKey(person, month, day);
    if (localStorage.getItem(key) === "1") {
      cell.classList.add("checked");
    }

    cell.addEventListener("click", () => {
      const isChecked = cell.classList.toggle("checked");
      localStorage.setItem(key, isChecked ? "1" : "0");
    });

    container.appendChild(cell);
  }
});

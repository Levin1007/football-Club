const config = window.APP_CONFIG;
const form = document.querySelector("#item-form");
const formFields = document.querySelector("#form-fields");
const cards = document.querySelector("#cards");
const statusBox = document.querySelector("#status");
const title = document.querySelector("#app-title");
const subtitle = document.querySelector("#app-subtitle");
const badge = document.querySelector("#theme-badge");
const summary = document.querySelector("#summary");
const submitButton = document.querySelector("#submit-button");
const resetButton = document.querySelector("#reset-button");

let editingId = null;

document.documentElement.style.setProperty("--accent", config.accent);
title.textContent = config.title;
subtitle.textContent = config.subtitle;
badge.textContent = config.plural;

function setStatus(message, type = "info") {
  statusBox.textContent = message;
  statusBox.dataset.type = type;
}

function buildForm() {
  formFields.innerHTML = "";

  config.fields.forEach((field) => {
    const group = document.createElement("label");
    group.className = "field";

    const caption = document.createElement("span");
    caption.textContent = field.required ? `${field.label} *` : field.label;

    const input = document.createElement("input");
    input.name = field.name;
    input.type = field.type === "number" ? "number" : "text";
    input.placeholder = field.label;
    input.required = Boolean(field.required);

    if (field.min !== undefined) input.min = field.min;
    if (field.max !== undefined) input.max = field.max;

    group.append(caption, input);
    formFields.appendChild(group);
  });
}

function fillForm(item) {
  editingId = item.id;
  config.fields.forEach((field) => {
    const input = form.elements[field.name];
    input.value = item[field.name] ?? "";
  });
  submitButton.textContent = "Update";
  resetButton.hidden = false;
}

function resetForm() {
  editingId = null;
  form.reset();
  submitButton.textContent = "Create";
  resetButton.hidden = true;
}

function renderItem(item) {
  const article = document.createElement("article");
  article.className = "card";

  const heading = document.createElement("h3");
  heading.textContent = item[config.fields[0].name];

  const details = document.createElement("dl");

  config.fields.slice(1).forEach((field) => {
    const term = document.createElement("dt");
    term.textContent = field.label;

    const value = document.createElement("dd");
    value.textContent = item[field.name] ?? "—";

    details.append(term, value);
  });

  const actions = document.createElement("div");
  actions.className = "card-actions";

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.className = "secondary";
  editButton.textContent = "Edit";
  editButton.addEventListener("click", () => fillForm(item));
  actions.appendChild(editButton);

  config.actions.forEach((action) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "secondary";
    button.textContent = action.label;
    button.addEventListener("click", () => runAction(item.id, action.id));
    actions.appendChild(button);
  });

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "danger";
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", () => deleteItem(item.id));
  actions.appendChild(deleteButton);

  article.append(heading, details, actions);
  return article;
}

async function loadItems() {
  try {
    const [itemsResponse, summaryResponse] = await Promise.all([
      fetch(`${config.apiBaseUrl}/items`),
      fetch(`${config.apiBaseUrl}/summary`),
    ]);

    if (!itemsResponse.ok) throw new Error(`Backend returned ${itemsResponse.status}`);

    const items = await itemsResponse.json();
    const summaryData = summaryResponse.ok ? await summaryResponse.json() : { total: items.length };

    cards.innerHTML = "";
    items.forEach((item) => cards.appendChild(renderItem(item)));

    summary.textContent = `${summaryData.total} ${config.plural} managed`;
    setStatus(`Loaded ${items.length} ${config.plural}.`, "success");
  } catch (error) {
    cards.innerHTML = "";
    setStatus(`Unable to load data: ${error.message}`, "error");
  }
}

async function saveItem(payload) {
  const url = editingId
    ? `${config.apiBaseUrl}/items/${editingId}`
    : `${config.apiBaseUrl}/items`;

  const response = await fetch(url, {
    method: editingId ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const detail = await response.json();
    throw new Error(detail.detail ?? `Backend returned ${response.status}`);
  }
}

async function deleteItem(itemId) {
  try {
    const response = await fetch(`${config.apiBaseUrl}/items/${itemId}`, { method: "DELETE" });
    if (!response.ok) throw new Error(`Backend returned ${response.status}`);
    await loadItems();
    setStatus(`${config.entity} deleted.`, "success");
  } catch (error) {
    setStatus(`Deletion failed: ${error.message}`, "error");
  }
}

async function runAction(itemId, actionId) {
  try {
    const response = await fetch(`${config.apiBaseUrl}/items/${itemId}/actions/${actionId}`, {
      method: "POST",
    });
    if (!response.ok) throw new Error(`Backend returned ${response.status}`);
    await loadItems();
    setStatus("Action completed.", "success");
  } catch (error) {
    setStatus(`Action failed: ${error.message}`, "error");
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = Object.fromEntries(new FormData(form).entries());

  try {
    await saveItem(payload);
    resetForm();
    await loadItems();
    setStatus(`${config.entity} saved successfully.`, "success");
  } catch (error) {
    setStatus(`Save failed: ${error.message}`, "error");
  }
});

resetButton.addEventListener("click", resetForm);

buildForm();
loadItems();

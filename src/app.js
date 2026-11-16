import { createDemoState } from "./demo.js";
import {
  addExpense,
  calculateBalances,
  recordSettlement,
  splitCustom,
  splitEqual,
  splitPercentage,
  suggestSettlements
} from "./finance.js";

const localeCodes = ["pt-BR", "en-US", "es-ES"];
const languageByBrowser = navigator.language.toLowerCase().startsWith("pt")
  ? "pt-BR"
  : navigator.language.toLowerCase().startsWith("es") ? "es-ES" : "en-US";
let language = languageByBrowser;
let dictionary = {};
let state = createDemoState();
let activePage = "home";
let selectedGroupId = state.groups[0]?.id ?? "";
let deferredInstallPrompt;

const root = document.querySelector("#app");
const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
})[character]);
const t = (key, values = {}) => {
  const value = key.split(".").reduce((object, part) => object?.[part], dictionary) ?? key;
  return escapeHTML(value.replace(/\{(\w+)\}/g, (_, name) => values[name] ?? ""));
};
const money = (cents) => new Intl.NumberFormat(language, {
  style: "currency", currency: "BRL"
}).format(cents / 100);
const date = (value) => new Intl.DateTimeFormat(language, {
  day: "numeric", month: "short", year: "numeric"
}).format(new Date(value));
const member = (id) => state.members.find((person) => person.id === id)?.name ?? id;
const amountCents = (value) => {
  const match = String(value).trim().match(/^(\d+)(?:\.(\d{1,2}))?$/);
  if (!match) return NaN;
  return Number(match[1]) * 100 + Number((match[2] ?? "").padEnd(2, "0"));
};
const percentageBasisPoints = (value) => {
  const match = String(value).trim().match(/^(?:100(?:\.0{1,2})?|\d{1,2}(?:\.\d{1,2})?)$/);
  if (!match) return NaN;
  const [whole, fraction = ""] = value.split(".");
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
};
const categoryKey = (category) => ({
  friends: "groups.categoryFriends",
  home: "groups.categoryHome",
  travel: "groups.categoryTravel",
  events: "groups.categoryEvents",
  other: "groups.categoryOther",
  food: "expenses.categoryFood",
  transport: "expenses.categoryTransport",
  accommodation: "expenses.categoryStay",
  groceries: "expenses.categoryGroceries"
})[category] ?? "expenses.categoryOther";

function expensesFor(groupId) {
  return state.expenses.filter((expense) => !groupId || expense.groupId === groupId);
}

function groupBalances(groupId) {
  return calculateBalances(state, groupId);
}

function historicalMemberIds(groupId) {
  const group = state.groups.find((item) => item.id === groupId);
  const pastParticipants = state.expenses
    .filter((expense) => expense.groupId === groupId)
    .flatMap((expense) => [expense.paidBy, ...Object.keys(expense.splits)]);
  return [...new Set([...(group?.memberIds ?? []), ...pastParticipants])];
}

function expenseCard(expense) {
  return `<article class="expense-row">
    <div class="expense-icon" aria-hidden="true">${escapeHTML(expense.description.slice(0, 1).toUpperCase())}</div>
    <div class="expense-copy"><strong>${escapeHTML(expense.description)}</strong><span>${t(categoryKey(expense.category))} · ${t("common.paidBy", { name: member(expense.paidBy) })}</span></div>
    <div class="expense-value"><strong>${money(expense.amountCents)}</strong><span>${date(expense.createdAt)}</span></div>
  </article>`;
}

function groupPicker() {
  return `<label class="compact-field"><span>${t("expenses.group")}</span><select name="selected-group" data-action="select-group">${state.groups.map((group) =>
    `<option value="${escapeHTML(group.id)}" ${group.id === selectedGroupId ? "selected" : ""}>${escapeHTML(group.name)}</option>`
  ).join("")}</select></label>`;
}

function homePage() {
  const balanceValues = state.groups.map((group) => groupBalances(group.id)[state.currentUserId] ?? 0);
  const owed = balanceValues.filter((amount) => amount < 0).reduce((sum, amount) => sum - amount, 0);
  const receivable = balanceValues.filter((amount) => amount > 0).reduce((sum, amount) => sum + amount, 0);
  const recent = [...state.expenses].slice(0, 4);
  return `<section class="welcome panel">
    <div><p class="eyebrow">${t("dashboard.eyebrow")}</p><h1>${t("dashboard.heading")}</h1><p>${t("dashboard.description")}</p></div>
    <div class="welcome-mark" aria-hidden="true"><span>R</span><i></i><i></i><i></i></div>
  </section>
  <section class="summary-grid" aria-label="${t("dashboard.heading")}">
    <article class="summary-card"><span class="summary-label">${t("dashboard.owed")}</span><strong class="negative">${money(owed)}</strong><span class="summary-foot">${t("common.alpha")}</span></article>
    <article class="summary-card"><span class="summary-label">${t("dashboard.receivable")}</span><strong class="positive">${money(receivable)}</strong><span class="summary-foot">${t("dashboard.activeGroups")}: ${state.groups.length}</span></article>
    <article class="summary-card summary-count"><span class="summary-label">${t("dashboard.totalExpenses")}</span><strong>${state.expenses.length}</strong><span class="summary-foot">${t("dashboard.activeGroups")}: ${state.groups.length}</span></article>
  </section>
  <section class="content-grid">
    <article class="panel activity-panel"><div class="section-heading"><div><p class="eyebrow">${t("dashboard.recent")}</p><h2>${t("dashboard.recent")}</h2></div><button class="text-button" data-page="expenses">${t("expenses.history")} ↗</button></div>
      ${recent.length ? `<div class="expense-list">${recent.map(expenseCard).join("")}</div>` : `<p class="empty-state">${t("common.empty")}</p>`}
    </article>
    <aside class="quick-card"><span class="quick-spark" aria-hidden="true">✳</span><p class="eyebrow">${t("dashboard.quickAction")}</p><h2>${t("dashboard.quickDescription")}</h2><button class="button button-light" data-page="expenses">${t("dashboard.addExpense")} <span aria-hidden="true">↗</span></button></aside>
  </section>
  <p class="demo-note"><span aria-hidden="true">✦</span> ${t("dashboard.demo")} <span class="offline-label">${t("common.offline")}</span></p>`;
}

function groupsPage() {
  return `<header class="page-heading"><div><p class="eyebrow">${t("groups.eyebrow")}</p><h1>${t("groups.heading")}</h1></div><span class="count-pill">${state.groups.length}</span></header>
  <div class="group-layout"><section class="group-stack">${state.groups.length ? state.groups.map((group) => `<article class="panel group-card">
    <div class="group-card-head"><div class="group-symbol" aria-hidden="true">${escapeHTML(group.name.slice(0, 1).toUpperCase())}</div><div><h2>${escapeHTML(group.name)}</h2><p>${t(categoryKey(group.category))} · ${t("groups.members", { count: group.memberIds.length })}</p></div></div>
    <div class="member-chips">${group.memberIds.map((id) => `<span class="member-chip">${escapeHTML(member(id))}<button type="button" data-remove-member="${escapeHTML(id)}" data-group-id="${escapeHTML(group.id)}" aria-label="${t("groups.removeMember", { name: member(id) })}">×</button></span>`).join("")}</div>
    <form class="inline-form" data-form="member" data-group-id="${escapeHTML(group.id)}"><label class="sr-only" for="member-${escapeHTML(group.id)}">${t("groups.memberName")}</label><input id="member-${escapeHTML(group.id)}" name="name" maxlength="60" placeholder="${t("groups.memberPlaceholder")}" required><button type="submit" class="button button-small">${t("groups.addMember")}</button></form>
  </article>`).join("") : `<p class="empty-state panel">${t("common.empty")}</p>`}</section>
  <aside class="panel form-panel"><p class="eyebrow">${t("groups.create")}</p><h2>${t("groups.create")}</h2><form data-form="group" class="stack-form">
    <label>${t("groups.name")}<input name="name" maxlength="60" placeholder="${t("groups.namePlaceholder")}" required></label>
    <label>${t("groups.category")}<select name="category"><option value="friends">${t("groups.categoryFriends")}</option><option value="home">${t("groups.categoryHome")}</option><option value="travel">${t("groups.categoryTravel")}</option><option value="events">${t("groups.categoryEvents")}</option><option value="other">${t("groups.categoryOther")}</option></select></label>
    <button class="button button-primary" type="submit">${t("groups.create")} <span aria-hidden="true">+</span></button>
  </form></aside></div>`;
}

function allocationRow(person, selectedCount, method) {
  const checked = true;
  const percentage = (100 / selectedCount).toFixed(2);
  return `<div class="participant-row">
    <label class="participant-check"><input type="checkbox" name="participant" value="${escapeHTML(person.id)}" ${checked ? "checked" : ""}><span class="checkmark" aria-hidden="true"></span><span>${escapeHTML(person.name)}</span></label>
    <label class="allocation-field" data-allocation="custom" ${method === "custom" ? "" : "hidden"}><span class="sr-only">${t("expenses.custom")} · ${escapeHTML(person.name)}</span><input name="custom_${escapeHTML(person.id)}" type="number" min="0" step="0.01" inputmode="decimal" placeholder="0.00" ${method === "custom" ? "" : "disabled"}></label>
    <label class="allocation-field" data-allocation="percentage" ${method === "percentage" ? "" : "hidden"}><span class="sr-only">${t("expenses.percentage")} · ${escapeHTML(person.name)}</span><input name="percentage_${escapeHTML(person.id)}" type="number" min="0" max="100" step="0.01" value="${percentage}" ${method === "percentage" ? "" : "disabled"}><span>%</span></label>
  </div>`;
}

function expensesPage() {
  const group = state.groups.find((item) => item.id === selectedGroupId);
  const people = group ? group.memberIds.map((id) => state.members.find((person) => person.id === id)).filter(Boolean) : [];
  const method = "equal";
  return `<header class="page-heading"><div><p class="eyebrow">${t("expenses.eyebrow")}</p><h1>${t("expenses.heading")}</h1></div></header>
  <div class="expense-layout"><section class="panel form-panel expense-form-panel"><p class="eyebrow">${t("expenses.new")}</p><h2>${t("expenses.new")}</h2>
    ${group ? `<form data-form="expense" class="stack-form">
      <label>${t("expenses.group")}<select name="groupId" data-action="expense-group">${state.groups.map((item) => `<option value="${escapeHTML(item.id)}" ${item.id === selectedGroupId ? "selected" : ""}>${escapeHTML(item.name)}</option>`).join("")}</select></label>
      <label>${t("expenses.description")}<input name="description" maxlength="100" placeholder="${t("expenses.descriptionPlaceholder")}" required></label>
      <div class="field-pair"><label>${t("expenses.amount")}<input name="amount" type="number" min="0.01" step="0.01" inputmode="decimal" placeholder="0.00" required></label>
      <label>${t("expenses.category")}<select name="category"><option value="food">${t("expenses.categoryFood")}</option><option value="transport">${t("expenses.categoryTransport")}</option><option value="accommodation">${t("expenses.categoryStay")}</option><option value="groceries">${t("expenses.categoryGroceries")}</option><option value="other">${t("expenses.categoryOther")}</option></select></label></div>
      <label>${t("expenses.paidBy")}<select name="paidBy">${people.map((person) => `<option value="${escapeHTML(person.id)}">${escapeHTML(person.name)}</option>`).join("")}</select></label>
      <fieldset class="participant-field"><legend>${t("expenses.participants")}</legend>${people.length ? `<div class="participant-list">${people.map((person) => allocationRow(person, people.length, method)).join("")}</div>` : `<p class="helper-text">${t("common.empty")}</p>`}</fieldset>
      <label>${t("expenses.splitMethod")}<select name="method" data-action="split-method"><option value="equal">${t("expenses.equal")}</option><option value="percentage">${t("expenses.percentage")}</option><option value="custom">${t("expenses.custom")}</option></select></label>
      <button class="button button-primary" type="submit">${t("common.save")} <span aria-hidden="true">↗</span></button>
    </form>` : `<p class="empty-state">${t("common.empty")}</p>`}
  </section><section class="panel history-panel"><div class="section-heading"><div><p class="eyebrow">${t("expenses.history")}</p><h2>${t("expenses.history")}</h2></div>${state.groups.length > 1 ? groupPicker() : ""}</div>
    <div class="expense-list">${expensesFor(selectedGroupId).map(expenseCard).join("") || `<p class="empty-state">${t("common.empty")}</p>`}</div>
  </section></div>`;
}

function settlementsPage() {
  const group = state.groups.find((item) => item.id === selectedGroupId);
  if (!group) return `<header class="page-heading"><div><p class="eyebrow">${t("settlements.eyebrow")}</p><h1>${t("settlements.heading")}</h1></div></header><p class="panel empty-state">${t("common.empty")}</p>`;
  const balances = groupBalances(group.id);
  const people = historicalMemberIds(group.id);
  const suggestions = suggestSettlements(balances);
  const payments = state.payments.filter((payment) => payment.groupId === group.id);
  return `<header class="page-heading"><div><p class="eyebrow">${t("settlements.eyebrow")}</p><h1>${t("settlements.heading")}</h1><p>${t("settlements.description")}</p></div>${state.groups.length > 1 ? groupPicker() : ""}</header>
  <div class="settlement-layout"><section class="panel balance-panel"><div class="section-heading"><div><p class="eyebrow">${t("settlements.balances")}</p><h2>${t("settlements.balances")}</h2></div></div>
    <div class="balance-list">${people.map((id) => `<div class="balance-row"><span class="avatar">${escapeHTML(member(id).slice(0, 1).toUpperCase())}</span><strong>${escapeHTML(member(id))}</strong><span class="${balances[id] > 0 ? "positive" : balances[id] < 0 ? "negative" : "balance-zero"}">${money(balances[id] ?? 0)}</span></div>`).join("")}</div>
  </section><section class="panel suggestions-panel"><div class="section-heading"><div><p class="eyebrow">${t("settlements.suggestions")}</p><h2>${t("settlements.suggestions")}</h2></div><span class="count-pill">${suggestions.length}</span></div>
    ${suggestions.length ? `<div class="suggestion-list">${suggestions.map((transfer) => `<article class="suggestion-row"><div class="transfer-people"><strong>${escapeHTML(member(transfer.payerId))}</strong><span aria-hidden="true">→</span><strong>${escapeHTML(member(transfer.receiverId))}</strong><span>${t("settlements.minimum")}</span></div><div class="transfer-action"><strong>${money(transfer.amountCents)}</strong><button class="button button-small button-primary" data-settle="${escapeHTML(transfer.payerId)}" data-receiver="${escapeHTML(transfer.receiverId)}" data-amount="${transfer.amountCents}">${t("settlements.record")}</button></div></article>`).join("")}</div>` : `<p class="settled-state"><span aria-hidden="true">✓</span> ${t("settlements.settled")}</p>`}
    <div class="payment-history"><p class="eyebrow">${t("settlements.history")}</p>${payments.length ? payments.map((payment) => `<div class="payment-row"><span>${escapeHTML(member(payment.payerId))} → ${escapeHTML(member(payment.receiverId))}</span><strong>${money(payment.amountCents)}</strong></div>`).join("") : `<p class="helper-text">${t("common.empty")}</p>`}</div>
  </section></div>`;
}

function pageContent() {
  if (activePage === "groups") return groupsPage();
  if (activePage === "expenses") return expensesPage();
  if (activePage === "settlements") return settlementsPage();
  return homePage();
}

function render() {
  document.documentElement.lang = language;
  document.title = `Rachid · ${t(`common.${activePage === "settlements" ? "settlements" : activePage}`)}`;
  root.innerHTML = `<div class="app-shell">
    <aside class="sidebar">
      <a class="brand" href="#" data-page="home"><span class="brand-icon" aria-hidden="true">r.</span><span><strong>${t("common.brand")}</strong><small>${t("common.subtitle")}</small></span></a>
      <nav class="main-nav" aria-label="${t("common.home")}">${[
        ["home", "common.home", "⌂"],
        ["groups", "common.groups", "◫"],
        ["expenses", "common.expenses", "↗"],
        ["settlements", "common.settlements", "⇄"]
      ].map(([page, key, icon]) => `<button class="nav-link ${activePage === page ? "active" : ""}" data-page="${page}" ${activePage === page ? 'aria-current="page"' : ""}><span class="nav-icon" aria-hidden="true">${icon}</span>${t(key)}</button>`).join("")}</nav>
      <div class="sidebar-foot"><span class="demo-avatar" aria-hidden="true">${escapeHTML(member(state.currentUserId).slice(0, 1).toUpperCase())}</span><div><strong>${escapeHTML(member(state.currentUserId))}</strong><small>${t("common.alpha")}</small></div></div>
    </aside>
    <main class="main-area"><header class="topbar"><div class="mobile-brand"><span class="brand-icon" aria-hidden="true">r.</span><strong>${t("common.brand")}</strong></div><div class="topbar-actions"><span class="session-badge"><i></i>${t("common.alpha")}</span><label class="language-picker"><span aria-hidden="true">◎</span><span class="sr-only">${t("common.language")}</span><select data-action="language" aria-label="${t("common.language")}">${localeCodes.map((code) => `<option value="${code}" ${code === language ? "selected" : ""}>${escapeHTML(code)}</option>`).join("")}</select></label><button class="reset-button" data-action="reset" title="${t("common.reset")}" aria-label="${t("common.reset")}">↻</button></div></header>
    <div class="page-content">${pageContent()}</div>
    <footer class="mobile-nav">${[
      ["home", "common.home", "⌂"], ["groups", "common.groups", "◫"], ["expenses", "common.expenses", "+"], ["settlements", "common.settlements", "⇄"]
    ].map(([page, key, icon]) => `<button data-page="${page}" class="${activePage === page ? "active" : ""}" ${activePage === page ? 'aria-current="page"' : ""}><span aria-hidden="true">${icon}</span>${t(key)}</button>`).join("")}</footer>
    </main></div>`;
}

function notify(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.setAttribute("role", "status");
  toast.textContent = message;
  document.body.append(toast);
  window.setTimeout(() => toast.remove(), 2600);
}

function selectedParticipants(form) {
  return [...form.querySelectorAll('input[name="participant"]:checked')].map((input) => input.value);
}

function handleChange(event) {
  const target = event.target;
  if (target.dataset.action === "language") {
    loadLanguage(target.value);
    return;
  }
  if (target.dataset.action === "select-group" || target.dataset.action === "expense-group") {
    selectedGroupId = target.value;
    render();
    return;
  }
  if (target.dataset.action === "split-method" || target.name === "participant") {
    const form = target.closest("form");
    const method = form.querySelector('[name="method"]').value;
    form.querySelectorAll(".participant-row").forEach((row) => {
      const checked = row.querySelector('[name="participant"]').checked;
      row.querySelectorAll("[data-allocation]").forEach((field) => {
        const visible = field.dataset.allocation === method && checked;
        field.hidden = !visible;
        field.querySelector("input").disabled = !visible;
      });
    });
  }
}

function handleSubmit(event) {
  const form = event.target;
  const type = form.dataset.form;
  if (!type) return;
  event.preventDefault();
  const data = new FormData(form);
  if (type === "group") {
    const name = String(data.get("name") ?? "").trim();
    if (!name) return notify(t("validation.groupName"));
    const id = crypto.randomUUID();
    state.groups.push({ id, name, category: data.get("category"), memberIds: [state.currentUserId] });
    selectedGroupId = id;
    activePage = "groups";
  } else if (type === "member") {
    const name = String(data.get("name") ?? "").trim();
    if (!name) return notify(t("validation.memberName"));
    const id = crypto.randomUUID();
    state.members.push({ id, name });
    state.groups.find((group) => group.id === form.dataset.groupId)?.memberIds.push(id);
  } else if (type === "expense") {
    const description = String(data.get("description") ?? "").trim();
    const cents = amountCents(data.get("amount"));
    const participants = selectedParticipants(form);
    if (!description) return notify(t("validation.description"));
    if (!Number.isSafeInteger(cents) || cents <= 0) return notify(t("validation.amount"));
    if (!participants.length) return notify(t("validation.participants"));
    const method = String(data.get("method"));
    let splits;
    try {
      if (method === "equal") splits = splitEqual(cents, participants);
      if (method === "custom") {
        const amounts = Object.fromEntries(participants.map((id) => [id, amountCents(data.get(`custom_${id}`))]));
        if (Object.values(amounts).some((amount) => !Number.isSafeInteger(amount))) {
          return notify(t("validation.custom"));
        }
        splits = splitCustom(cents, amounts);
      }
      if (method === "percentage") {
        const percentages = Object.fromEntries(participants.map((id) => [id, percentageBasisPoints(String(data.get(`percentage_${id}`) ?? ""))]));
        if (Object.values(percentages).some((amount) => !Number.isSafeInteger(amount))) {
          return notify(t("validation.percentage"));
        }
        splits = splitPercentage(cents, percentages);
      }
      addExpense(state, {
        groupId: String(data.get("groupId")),
        description,
        amountCents: cents,
        category: String(data.get("category")),
        paidBy: String(data.get("paidBy")),
        splits,
        method
      });
      selectedGroupId = String(data.get("groupId"));
    } catch (error) {
      return notify(error.message === "invalid_percentages" ? t("validation.percentage") : t("validation.custom"));
    }
  }
  render();
}

function handleClick(event) {
  const pageButton = event.target.closest("[data-page]");
  if (pageButton) {
    event.preventDefault();
    activePage = pageButton.dataset.page;
    render();
    return;
  }
  const reset = event.target.closest('[data-action="reset"]');
  if (reset) {
    if (window.confirm(t("confirm.reset"))) {
      state = createDemoState();
      selectedGroupId = state.groups[0]?.id ?? "";
      activePage = "home";
      render();
    }
    return;
  }
  const remove = event.target.closest("[data-remove-member]");
  if (remove) {
    const group = state.groups.find((item) => item.id === remove.dataset.groupId);
    if (group && group.memberIds.length > 1) {
      group.memberIds = group.memberIds.filter((id) => id !== remove.dataset.removeMember);
      render();
    }
    return;
  }
  const settle = event.target.closest("[data-settle]");
  if (settle) {
    try {
      recordSettlement(state, selectedGroupId, {
        payerId: settle.dataset.settle,
        receiverId: settle.dataset.receiver,
        amountCents: Number(settle.dataset.amount)
      });
      render();
      notify(t("settlements.recorded"));
    } catch {
      render();
    }
  }
}

async function loadLanguage(code) {
  const response = await fetch(`/locales/${code}.json`);
  if (!response.ok) return;
  dictionary = await response.json();
  language = localeCodes.includes(code) ? code : "en-US";
  render();
}

root.addEventListener("change", handleChange);
root.addEventListener("submit", handleSubmit);
root.addEventListener("click", handleClick);
root.addEventListener("input", (event) => {
  if (event.target.name === "amount" && event.target.value) {
    event.target.setCustomValidity(/^\d+(?:\.\d{1,2})?$/.test(event.target.value) ? "" : t("validation.amount"));
  }
});
window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
});

await loadLanguage(language);
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").catch(() => {});
}

export function splitEqual(totalCents, participantIds) {
  if (!Number.isSafeInteger(totalCents) || totalCents < 0 || participantIds.length === 0) {
    throw new Error("invalid_split");
  }
  const base = Math.floor(totalCents / participantIds.length);
  const remainder = totalCents % participantIds.length;
  return Object.fromEntries(participantIds.map((id, index) => [id, base + (index < remainder ? 1 : 0)]));
}

export function splitPercentage(totalCents, percentages) {
  const entries = Object.entries(percentages);
  if (!entries.length || entries.some(([, value]) => !Number.isSafeInteger(value) || value < 0) ||
      entries.reduce((sum, [, value]) => sum + value, 0) !== 10000) {
    throw new Error("invalid_percentages");
  }
  const exact = entries.map(([id, basisPoints]) => {
    const numerator = totalCents * basisPoints;
    return { id, cents: Math.floor(numerator / 10000), remainder: numerator % 10000 };
  });
  let remaining = totalCents - exact.reduce((sum, entry) => sum + entry.cents, 0);
  exact.sort((a, b) => b.remainder - a.remainder || a.id.localeCompare(b.id));
  for (let index = 0; index < remaining; index += 1) exact[index].cents += 1;
  return Object.fromEntries(exact.map(({ id, cents }) => [id, cents]));
}

export function splitCustom(totalCents, amounts) {
  const entries = Object.entries(amounts);
  if (!entries.length || entries.some(([, value]) => !Number.isSafeInteger(value) || value < 0) ||
      entries.reduce((sum, [, value]) => sum + value, 0) !== totalCents) {
    throw new Error("invalid_custom_amounts");
  }
  return Object.fromEntries(entries);
}

export function calculateBalances(state, groupId) {
  const group = state.groups.find((item) => item.id === groupId);
  if (!group) throw new Error("group_not_found");
  const result = Object.fromEntries(group.memberIds.map((id) => [id, 0]));
  for (const expense of state.expenses.filter((item) => item.groupId === groupId)) {
    result[expense.paidBy] = (result[expense.paidBy] ?? 0) + expense.amountCents;
    for (const [memberId, cents] of Object.entries(expense.splits)) {
      result[memberId] = (result[memberId] ?? 0) - cents;
    }
  }
  for (const payment of state.payments.filter((item) => item.groupId === groupId && item.status === "confirmed")) {
    result[payment.payerId] = (result[payment.payerId] ?? 0) + payment.amountCents;
    result[payment.receiverId] = (result[payment.receiverId] ?? 0) - payment.amountCents;
  }
  return result;
}

export function suggestSettlements(balances) {
  const creditors = Object.entries(balances)
    .filter(([, amount]) => amount > 0)
    .map(([id, amount]) => ({ id, amount }))
    .sort((a, b) => b.amount - a.amount || a.id.localeCompare(b.id));
  const debtors = Object.entries(balances)
    .filter(([, amount]) => amount < 0)
    .map(([id, amount]) => ({ id, amount: -amount }))
    .sort((a, b) => b.amount - a.amount || a.id.localeCompare(b.id));
  const transfers = [];
  let creditorIndex = 0;
  let debtorIndex = 0;
  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const amountCents = Math.min(creditors[creditorIndex].amount, debtors[debtorIndex].amount);
    transfers.push({
      payerId: debtors[debtorIndex].id,
      receiverId: creditors[creditorIndex].id,
      amountCents
    });
    creditors[creditorIndex].amount -= amountCents;
    debtors[debtorIndex].amount -= amountCents;
    if (!creditors[creditorIndex].amount) creditorIndex += 1;
    if (!debtors[debtorIndex].amount) debtorIndex += 1;
  }
  if (creditors.some(({ amount }) => amount) || debtors.some(({ amount }) => amount)) {
    throw new Error("unbalanced_group");
  }
  return transfers;
}

export function addExpense(state, expense) {
  const group = state.groups.find((item) => item.id === expense.groupId);
  if (!group || !group.memberIds.includes(expense.paidBy)) throw new Error("invalid_group_or_payer");
  const splits = Object.entries(expense.splits);
  if (!expense.description.trim() || !Number.isSafeInteger(expense.amountCents) ||
      expense.amountCents <= 0 || splits.length === 0 ||
      splits.some(([id, cents]) => !group.memberIds.includes(id) || !Number.isSafeInteger(cents) || cents < 0) ||
      splits.reduce((sum, [, cents]) => sum + cents, 0) !== expense.amountCents) {
    throw new Error("invalid_expense");
  }
  state.expenses.unshift({ ...expense, id: crypto.randomUUID(), createdAt: new Date().toISOString() });
}

export function recordSettlement(state, groupId, transfer) {
  const allowed = suggestSettlements(calculateBalances(state, groupId)).some((suggestion) =>
    suggestion.payerId === transfer.payerId && suggestion.receiverId === transfer.receiverId &&
    suggestion.amountCents === transfer.amountCents
  );
  if (!allowed) throw new Error("invalid_settlement");
  state.payments.unshift({
    ...transfer,
    groupId,
    id: crypto.randomUUID(),
    status: "confirmed",
    createdAt: new Date().toISOString()
  });
}

import test from "node:test";
import assert from "node:assert/strict";
import { createDemoState } from "../src/demo.js";
import {
  addExpense,
  calculateBalances,
  recordSettlement,
  splitCustom,
  splitEqual,
  splitPercentage,
  suggestSettlements
} from "../src/finance.js";

test("equal split assigns every remainder cent exactly once", () => {
  assert.deepEqual(splitEqual(100, ["a", "b", "c"]), { a: 34, b: 33, c: 33 });
});

test("percentage split uses largest remainders and preserves total cents", () => {
  const result = splitPercentage(101, { a: 3333, b: 3333, c: 3334 });
  assert.deepEqual(Object.values(result).sort((a, b) => a - b), [33, 34, 34]);
  assert.equal(Object.values(result).reduce((sum, amount) => sum + amount, 0), 101);
  assert.throws(() => splitPercentage(100, { a: 5000, b: 4999 }), /invalid_percentages/);
});

test("custom split rejects amounts that do not exactly match the total", () => {
  assert.deepEqual(splitCustom(100, { a: 20, b: 80 }), { a: 20, b: 80 });
  assert.throws(() => splitCustom(100, { a: 20, b: 79 }), /invalid_custom_amounts/);
});

test("balances derive to zero overall and reflect confirmed simulated payments", () => {
  const state = createDemoState();
  const before = calculateBalances(state, "friends-trip");
  assert.equal(Object.values(before).reduce((sum, amount) => sum + amount, 0), 0);
  const [transfer] = suggestSettlements(before);
  recordSettlement(state, "friends-trip", transfer);
  const after = calculateBalances(state, "friends-trip");
  assert.equal(after[transfer.payerId], before[transfer.payerId] + transfer.amountCents);
  assert.equal(after[transfer.receiverId], before[transfer.receiverId] - transfer.amountCents);
  assert.equal(Object.values(after).reduce((sum, amount) => sum + amount, 0), 0);
  assert.throws(() => recordSettlement(state, "friends-trip", transfer), /invalid_settlement/);
});

test("settlement suggestions handle zero balances and clear all balances", () => {
  assert.deepEqual(suggestSettlements({ a: 0, b: 0 }), []);
  const transfers = suggestSettlements({ alice: 9000, bob: -4000, carol: -3000, david: -2000 });
  assert.equal(transfers.length, 3);
  const remaining = { alice: 9000, bob: -4000, carol: -3000, david: -2000 };
  for (const { payerId, receiverId, amountCents } of transfers) {
    remaining[payerId] += amountCents;
    remaining[receiverId] -= amountCents;
  }
  assert.deepEqual(remaining, { alice: 0, bob: 0, carol: 0, david: 0 });
});

test("new expenses validate group membership and exact allocations", () => {
  const state = createDemoState();
  assert.throws(() => addExpense(state, {
    groupId: "friends-trip",
    description: "Test",
    amountCents: 100,
    paidBy: "outsider",
    splits: { ana: 100 }
  }), /invalid_group_or_payer/);
  assert.throws(() => addExpense(state, {
    groupId: "friends-trip",
    description: "Test",
    amountCents: 100,
    paidBy: "ana",
    splits: { ana: 99 }
  }), /invalid_expense/);
});

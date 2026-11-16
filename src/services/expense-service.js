import {
  calculateBalances,
  splitCustom,
  splitEqual,
  splitPercentage,
  suggestSettlements
} from "../finance.js";

export class ExpenseService {
  constructor(repository) {
    this.repository = repository;
  }

  balances(groupId) {
    return calculateBalances(this.repository.getState(), groupId);
  }

  suggestions(groupId) {
    return suggestSettlements(this.balances(groupId));
  }

  createExpense({ method, customAmounts, percentages, ...expense }) {
    let splits;
    if (method === "equal") splits = splitEqual(expense.amountCents, expense.participants);
    if (method === "custom") splits = splitCustom(expense.amountCents, customAmounts);
    if (method === "percentage") splits = splitPercentage(expense.amountCents, percentages);
    if (!splits) throw new Error("invalid_split_method");
    this.repository.addExpense({ ...expense, splits, method });
  }

  recordSettlement(groupId, transfer) {
    this.repository.recordSettlement(groupId, transfer);
  }
}

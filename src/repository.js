import { createDemoState } from "./demo.js";
import { addExpense, recordSettlement } from "./finance.js";

export class InMemoryExpenseRepository {
  #state = createDemoState();

  getState() {
    return this.#state;
  }

  reset() {
    this.#state = createDemoState();
  }

  createGroup(name, category) {
    const id = crypto.randomUUID();
    this.#state.groups.push({
      id,
      name,
      category,
      memberIds: [this.#state.currentUserId]
    });
    return id;
  }

  renameGroup(groupId, name) {
    const group = this.#state.groups.find((item) => item.id === groupId);
    if (group) group.name = name;
  }

  addMember(groupId, name) {
    const group = this.#state.groups.find((item) => item.id === groupId);
    if (!group) throw new Error("group_not_found");
    const id = crypto.randomUUID();
    this.#state.members.push({ id, name });
    group.memberIds.push(id);
    return id;
  }

  removeMember(groupId, memberId) {
    const group = this.#state.groups.find((item) => item.id === groupId);
    if (group && group.memberIds.length > 1) {
      group.memberIds = group.memberIds.filter((id) => id !== memberId);
    }
  }

  addExpense(expense) {
    addExpense(this.#state, expense);
  }

  recordSettlement(groupId, transfer) {
    recordSettlement(this.#state, groupId, transfer);
  }
}

export function createDemoState() {
  const members = [
    { id: "ana", name: "Ana" },
    { id: "bruno", name: "Bruno" },
    { id: "carla", name: "Carla" },
    { id: "diego", name: "Diego" }
  ];
  return {
    currentUserId: "ana",
    groups: [{ id: "friends-trip", name: "Serra weekend", category: "travel", memberIds: members.map(({ id }) => id) }],
    members,
    expenses: [
      { id: "dinner", groupId: "friends-trip", description: "Dinner", category: "food", amountCents: 12800, paidBy: "ana", splits: { ana: 3200, bruno: 3200, carla: 3200, diego: 3200 }, createdAt: "2026-11-15T20:00:00.000Z" },
      { id: "ride", groupId: "friends-trip", description: "Ride share", category: "transport", amountCents: 4200, paidBy: "bruno", splits: { ana: 1050, bruno: 1050, carla: 1050, diego: 1050 }, createdAt: "2026-11-15T16:00:00.000Z" },
      { id: "stay", groupId: "friends-trip", description: "Cabin", category: "accommodation", amountCents: 24000, paidBy: "carla", splits: { ana: 6000, bruno: 6000, carla: 6000, diego: 6000 }, createdAt: "2026-11-14T12:00:00.000Z" },
      { id: "market", groupId: "friends-trip", description: "Groceries", category: "groceries", amountCents: 7600, paidBy: "diego", splits: { ana: 1900, bruno: 1900, carla: 1900, diego: 1900 }, createdAt: "2026-11-14T09:00:00.000Z" }
    ],
    payments: []
  };
}

// src/billsplitLogic.test.js
import { describe, test, expect } from "vitest";
import { calculateBalances } from "./billsplitLogic";

// Small helper to round to 2 decimals
function round2(x) {
  return Math.round(x * 100) / 100;
}

describe("BillSplit balance calculations", () => {
  test("splits a single equal expense correctly between two people", () => {
    const participants = [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ];

    const expenses = [
      {
        id: 101,
        desc: "Dinner",
        amount: 100,
        payerId: 1,
        splitMode: "equal",
        percents: null,
      },
    ];

    const balances = calculateBalances(participants, expenses);

    const alice = round2(balances.get(1) || 0);
    const bob = round2(balances.get(2) || 0);

    expect(alice).toBe(50);
    expect(bob).toBe(-50);
  });

  test("splits a single expense using custom percentages", () => {
    const participants = [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ];

    const expenses = [
      {
        id: 102,
        desc: "Hotel",
        amount: 200,
        payerId: 2,
        splitMode: "percent",
        percents: {
          1: 25,
          2: 75,
        },
      },
    ];

    const balances = calculateBalances(participants, expenses);

    const alice = round2(balances.get(1) || 0);
    const bob = round2(balances.get(2) || 0);


    expect(alice).toBe(-50);
    expect(bob).toBe(50);
  });
});

import React, { useState } from "react";
import "./App.css";
import { calculateBalances } from "./billsplitLogic";

function App() {
  // List of people taking part in the split
  const [participants, setParticipants] = useState([]);
  const [participantName, setParticipantName] = useState("");

  // List of all expenses added so far
  const [expenses, setExpenses] = useState([]);
  const [expenseDesc, setExpenseDesc] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expensePayer, setExpensePayer] = useState("");
  const [expenseSplitMode, setExpenseSplitMode] = useState("equal");

  // Percentages for the expense currently being created (Custom % mode)
  const [currentPercents, setCurrentPercents] = useState({});

  // Calculated results
  const [balances, setBalances] = useState(null);
  const [settlements, setSettlements] = useState(null);


  // Adds a new participant with a unique ID
  function addParticipant() {
    const name = participantName.trim();
    if (!name) return;

    const newParticipant = {
      id: Date.now(),
      name,
    };

    setParticipants((prev) => [...prev, newParticipant]);
    setParticipantName("");
    setBalances(null);
    setSettlements(null);
  }

  // Removes a participant and any expenses where they are the payer
  function removeParticipant(id) {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
    setExpenses((prev) => prev.filter((e) => e.payerId !== id));
    setBalances(null);
    setSettlements(null);
  }

  // Stores the percentage for each participant for the current expense
  function updateCurrentPercent(id, value) {
    const percent = Number(value);
    setCurrentPercents((prev) => ({
      ...prev,
      [id]: isNaN(percent) || percent < 0 ? 0 : percent,
    }));
    setBalances(null);
    setSettlements(null);
  }

  // Clears all current percentage values
  function resetCurrentPercents() {
    setCurrentPercents({});
  }


  function addExpense() {
    // Require at least two participants for any split
    if (participants.length < 2) {
      alert("Add at least two participants before adding an expense.");
      return;
    }

    const amount = Number(expenseAmount);
    if (!amount || amount <= 0 || isNaN(amount)) {
      alert("Enter a valid amount.");
      return;
    }

    const payerId = Number(expensePayer);
    if (!payerId) {
      alert("Select who paid.");
      return;
    }

    let percentsForExpense = null;

    if (expenseSplitMode === "percent") {
      // Check if the custom percentages add up to 100%
      const totalPercent = participants.reduce(
        (sum, p) => sum + (currentPercents[p.id] || 0),
        0
      );

      if (Math.abs(totalPercent - 100) > 0.01) {
        alert(
          `For Custom % split, the total must be 100%. Current total: ${totalPercent.toFixed(
            2
          )}%.`
        );
        return;
      }

      // Snapshot of the percentages for this specific expense
      percentsForExpense = {};
      participants.forEach((p) => {
        percentsForExpense[p.id] = currentPercents[p.id] || 0;
      });
    }

    const newExpense = {
      id: Date.now(),
      desc: expenseDesc.trim(),
      amount,
      payerId,
      splitMode: expenseSplitMode,
      percents: percentsForExpense,
    };

    setExpenses((prev) => [...prev, newExpense]);
    setExpenseDesc("");
    setExpenseAmount("");
    setBalances(null);
    setSettlements(null);
    resetCurrentPercents();
  }

  // Deletes an existing expense from the list
  function removeExpense(id) {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    setBalances(null);
    setSettlements(null);
  }

  
  function calculate() {
    if (participants.length < 2) {
      alert("You need at least two participants to calculate a split.");
      return;
    }

    if (expenses.length === 0) {
      alert("Add at least one expense first.");
      return;
    }

    // Use shared, testable logic from billsplitLogic.js
    const bal = calculateBalances(participants, expenses);

    setBalances(bal);
    setSettlements(computeSettlements(bal, participants));
  }

  function computeSettlements(balances, participants) {
    const creditors = [];
    const debtors = [];

    balances.forEach((value, id) => {
      const rounded = Math.round(value * 100) / 100;
      if (rounded > 0.005) {
        creditors.push({ id, amount: rounded });
      } else if (rounded < -0.005) {
        debtors.push({ id, amount: -rounded });
      }
    });

    creditors.sort((a, b) => b.amount - a.amount);
    debtors.sort((a, b) => b.amount - a.amount);

    const result = [];
    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      const amount = Math.min(debtor.amount, creditor.amount);

      const debtorName =
        participants.find((p) => p.id === debtor.id)?.name || "Debtor";
      const creditorName =
        participants.find((p) => p.id === creditor.id)?.name || "Creditor";

      result.push({
        from: debtorName,
        to: creditorName,
        amount: amount,
      });

      debtor.amount -= amount;
      creditor.amount -= amount;

      if (debtor.amount <= 0.005) i++;
      if (creditor.amount <= 0.005) j++;
    }

    return result;
  }

  return (
    <div className="page">
      <div className="app">
        <header className="header">
          <div>
            <h1>BillSplit Web</h1>
            <p className="tagline">
              Split shared expenses fairly, offline, in your browser.
            </p>
          </div>
          <p className="muted">
            No login.
          </p>
        </header>

        <div className="layout">
          {/* Participants card */}
          <section className="card">
            <h2>1. Participants</h2>
            <p className="subtitle">
              Add everyone involved in this bill or trip.
            </p>

            <div className="row">
              <input
                type="text"
                placeholder="Name (e.g., Bob)"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
              />
              <button onClick={addParticipant} className="btn btn-primary">
                Add
              </button>
            </div>

            <div className="list">
              {participants.length === 0 ? (
                <p className="muted">
                  No participants yet. Add at least two to start splitting.
                </p>
              ) : participants.length === 1 ? (
                <p className="muted">
                  Add one more person to start splitting expenses.
                </p>
              ) : (
                participants.map((p) => (
                  <div key={p.id} className="list-item">
                    <span className="list-label">{p.name}</span>
                    <button
                      onClick={() => removeParticipant(p.id)}
                      className="btn btn-ghost"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Expenses + Summary card */}
          <section className="card">
            <h2>2. Expenses & Summary</h2>
            <p className="subtitle">
              Add each item, choose who paid, and how to split it.
            </p>

            <div className="row-4">
              <input
                type="text"
                placeholder="Description"
                value={expenseDesc}
                onChange={(e) => setExpenseDesc(e.target.value)}
              />
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Amount"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
              />
              <select
                value={expensePayer}
                onChange={(e) => setExpensePayer(e.target.value)}
              >
                <option value="">Payer</option>
                {participants.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <select
                value={expenseSplitMode}
                onChange={(e) => {
                  setExpenseSplitMode(e.target.value);
                  if (e.target.value === "equal") {
                    resetCurrentPercents();
                  }
                }}
              >
                <option value="equal">Equal</option>
                <option value="percent">Custom %</option>
              </select>
            </div>

            {/* Custom % inputs for the current expense */}
            {expenseSplitMode === "percent" && (
              <div className="percent-block">
                <p className="subtitle">
                  Set how this item should be split. All percentages must total
                  100%.
                </p>
                <div className="percent-grid">
                  {participants.length === 0 ? (
                    <p className="muted">
                      Add participants to enter percentages.
                    </p>
                  ) : (
                    participants.map((p) => (
                      <div key={p.id} className="percent-row">
                        <span>{p.name}</span>
                        <div className="percent-input">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={currentPercents[p.id] || ""}
                            onChange={(e) =>
                              updateCurrentPercent(p.id, e.target.value)
                            }
                          />
                          <span className="percent-symbol">%</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <button
              onClick={addExpense}
              className="btn btn-primary mt"
              disabled={participants.length < 2}
            >
              Add Expense
            </button>

            <div className="list mt">
              {expenses.length === 0 ? (
                <p className="muted">No expenses yet.</p>
              ) : (
                expenses.map((e) => {
                  const payer =
                    participants.find((p) => p.id === e.payerId)?.name ||
                    "Unknown";
                  return (
                    <div key={e.id} className="list-item">
                      <div>
                        <div className="list-label">
                          {e.desc || "(No description)"}
                        </div>
                        <div className="list-meta">
                          ${e.amount.toFixed(2)} · paid by {payer} ·{" "}
                          {e.splitMode === "equal"
                            ? "Equal split"
                            : "Custom % split"}
                        </div>
                      </div>
                      <button
                        onClick={() => removeExpense(e.id)}
                        className="btn btn-ghost"
                      >
                        Remove
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="toolbar mt-lg">
              <button
                onClick={calculate}
                className="btn btn-primary"
                disabled={participants.length < 2 || expenses.length === 0}
              >
                Calculate
              </button>
              <button
                onClick={() => window.print()}
                className="btn btn-outline"
              >
                Print / Save
              </button>
            </div>

            {/* Net balances view */}
            {balances && (
              <div className="mt-lg">
                <h3>Net Balances</h3>
                <div className="summary">
                  {participants.map((p) => {
                    const value = balances.get(p.id) || 0;
                    const rounded = Math.round(value * 100) / 100;
                    if (rounded > 0) {
                      return (
                        <div key={p.id} className="summary-item positive">
                          {p.name} should receive ${rounded.toFixed(2)}
                        </div>
                      );
                    }
                    if (rounded < 0) {
                      return (
                        <div key={p.id} className="summary-item negative">
                          {p.name} owes ${Math.abs(rounded).toFixed(2)}
                        </div>
                      );
                    }
                    return (
                      <div key={p.id} className="summary-item">
                        {p.name} is settled.
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Suggested payments list */}
            {settlements && settlements.length > 0 && (
              <div className="mt-lg settlement">
                <h3>Suggested Payments</h3>
                {settlements.map((s, index) => (
                  <div key={index} className="settlement-item">
                    {s.from} → {s.to}: ${s.amount.toFixed(2)}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default App;
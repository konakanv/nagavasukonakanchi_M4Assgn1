export function calculateBalances(participants, expenses) {
  const bal = new Map();

  // Start everyone at 0
  participants.forEach((p) => bal.set(p.id, 0));

  for (const exp of expenses) {
    const payerId = exp.payerId;
    const amount = exp.amount;

    if (!bal.has(payerId)) continue;

    // Credit payer with full amount
    bal.set(payerId, bal.get(payerId) + amount);

    const shares = new Map();

    if (exp.splitMode === "equal") {
      // Equal split: everyone pays the same amount
      const perPerson = amount / participants.length;
      participants.forEach((p) => shares.set(p.id, perPerson));
    } else if (exp.splitMode === "percent" && exp.percents) {
      // Custom % split: (percent / 100) * amount per person
      participants.forEach((p) => {
        const percent = exp.percents[p.id] || 0;
        const share = (percent / 100) * amount;
        shares.set(p.id, share);
      });
    }

    // Subtract each participant's share from their balance
    shares.forEach((share, id) => {
      bal.set(id, bal.get(id) - share);
    });
  }

  return bal;
}
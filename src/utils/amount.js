const AMOUNT_DIFFERENCE_THRESHOLD = 0.2;

const amountDifference = (amount1, amount2)=> {
    let diff = Math.abs(amount1-amount2).toFixed(2);
    let largeramount = amount1>amount2? amount1:amount2;
    let amountPercentage = diff/largeramount;
    return amountPercentage <= AMOUNT_DIFFERENCE_THRESHOLD;
};
const averageAmount = (amount1, amount2) => {
  return ((amount1 + amount2)/2);
};

export default {
    amountDifference,
    averageAmount
}
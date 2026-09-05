/**
 * Precise Decimal Helper for Double-Entry Accounting
 * Prevents JavaScript floating-point errors (e.g. 0.1 + 0.2 !== 0.3)
 */

function round(num, decimals = 2) {
  const factor = Math.pow(10, decimals);
  return Math.round((Number(num) + Number.EPSILON) * factor) / factor;
}

function toFixedNumber(num, decimals = 2) {
  return parseFloat(Number(num || 0).toFixed(decimals));
}

function add(a, b) {
  return round(Number(a || 0) + Number(b || 0));
}

function subtract(a, b) {
  return round(Number(a || 0) - Number(b || 0));
}

function multiply(a, b) {
  return round(Number(a || 0) * Number(b || 0));
}

function divide(a, b) {
  if (Number(b) === 0) return 0;
  return round(Number(a || 0) / Number(b));
}

function isZero(val, tolerance = 0.005) {
  return Math.abs(Number(val || 0)) < tolerance;
}

function areEqual(a, b, tolerance = 0.005) {
  return Math.abs(Number(a || 0) - Number(b || 0)) < tolerance;
}

module.exports = {
  round,
  toFixedNumber,
  add,
  subtract,
  multiply,
  divide,
  isZero,
  areEqual,
};

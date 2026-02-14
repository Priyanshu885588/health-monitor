function validateHeartRate(hr) {
  if (typeof hr !== "number") return false;
  if (hr < 30 || hr > 250) return false; // Realistic human limits
  return true;
}

module.exports = { validateHeartRate };

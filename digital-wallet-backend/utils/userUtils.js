async function generatePaymentHandle(user) {
  const User = require("../models/User");

  const firstName = user.name?.split(" ")[0]?.toLowerCase() || "user";
  const last4 =
    user.phone?.slice(-4) || Math.floor(1000 + Math.random() * 9000);
  const base = `${firstName}${last4}`;
  let handle = `${base}@safepay`;
  let suffix = 1;

  while (await User.exists({ paymentHandle: handle })) {
    handle = `${base}.${suffix}@safepay`;
    suffix++;
  }

  return handle;
}

module.exports = { generatePaymentHandle };

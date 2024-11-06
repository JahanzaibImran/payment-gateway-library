const { mongoose } = require("mongoose");

const orderSchema = new mongoose.Schema({
  amount: String,
  currency: String,
  customerName: String,
  creditCardType: String,
  paymentResponse: Object,
});
const Order = mongoose.model("Order", orderSchema);

module.exports = { Order };

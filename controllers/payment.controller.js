const { Order } = require("../models/order.model");
const { processPayment } = require("../paymentGateway");

const payment = async (req, res) => {
  try {
    console.log(req.body);
    const { amount, currency, customerName, creditCard } = req.body;

    if (!amount || !currency || !customerName || !creditCard) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const { holderName, number, expirationMonth, expirationYear, cvv, type } =
      creditCard;
    if (!holderName || !number || !expirationMonth || !expirationYear || !cvv) {
      return res
        .status(400)
        .json({ success: false, message: "Incomplete credit card details" });
    }

    const paymentData = {
      amount,
      currency,
      customerName,
      creditCard: {
        holderName,
        number,
        expirationMonth,
        expirationYear,
        cvv,
      },
    };

    const paymentResponse = await processPayment(paymentData);

    const order = new Order({
      amount,
      currency,
      customerName,
      creditCardType: type,
      paymentResponse,
    });

    await order.save();

    res.json({ success: true, message: "Payment successful", paymentResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { payment };

require("dotenv").config();


const { Order } = require("../models/order.model");
const paypal = require("paypal-rest-sdk");
const braintree = require("braintree");

paypal.configure({
  mode: "sandbox", // Sandbox for testing
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_CLIENT_SECRET,
});

const braintreeGateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

function processPayment(paymentData) {
  const { currency, cardType, amount, creditCard } = paymentData;

  if (cardType === "AMEX" || ["USD", "EUR", "AUD"].includes(currency)) {
    if (currency !== "USD" && cardType === "AMEX") {
      throw new Error("AMEX is only supported for USD.");
    }
    return paypalPayment(amount, creditCard);
  }

  return braintreePayment(amount, creditCard);
}

function paypalPayment(amount, creditCard) {
  return new Promise((resolve, reject) => {
    const createPaymentJson = {
      intent: "sale",
      payer: {
        payment_method: "credit_card",
        funding_instruments: [
          {
            credit_card: {
              number: creditCard.number,
              type: creditCard.type,
              expire_month: creditCard.expirationMonth,
              expire_year: creditCard.expirationYear,
              cvv2: creditCard.cvv,
              first_name: creditCard.holderName,
            },
          },
        ],
      },
      transactions: [
        {
          amount: {
            total: amount,
            currency: "USD",
          },
          description: "Payment description.",
        },
      ],
    };

    paypal.payment.create(createPaymentJson, (error, payment) => {
      if (error) return reject(error);
      resolve(payment);
    });
  });
}

function braintreePayment(amount, creditCard) {
  return braintreeGateway.transaction.sale({
    amount,
    creditCard: {
      number: creditCard.number,
      expirationMonth: creditCard.expirationMonth,
      expirationYear: creditCard.expirationYear,
      cvv: creditCard.cvv,
    },
    options: { submitForSettlement: true },
  });
}


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

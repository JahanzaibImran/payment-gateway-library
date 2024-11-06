require("dotenv").config();

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

module.exports = { processPayment };

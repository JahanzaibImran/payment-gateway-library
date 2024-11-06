# Payment Gateway Integration

This project demonstrates a payment gateway integration with **PayPal** and **Braintree**. The backend server uses **Node.js** with **Express**, and the payment library integrates PayPal and Braintree APIs for credit card payments. 

The rules for selecting a gateway are:
- **AMEX cards** or payments in **USD**, **EUR**, or **AUD** currencies use **PayPal**.
- All other currencies use **Braintree**.
- If a payment with **AMEX** is attempted in a currency other than **USD**, an error message is returned.

## Features

- Accepts payments with **credit cards**.
- Uses **PayPal REST API** and **Braintree Payments API** for processing payments.
- Stores order and response data in a **MongoDB** database.
- Simple HTML form for payment input (located in the `public` folder).
- **Form validation** for code quality and robustness.

## Technologies Used

- **Node.js** & **Express.js** - Backend server
- **MongoDB** - Database to store order and payment data
- **PayPal REST SDK** and **Braintree SDK** - Payment processing
- **Jest** - Unit testing

## Prerequisites

- **Node.js** (version >= 14)
- **MongoDB** (running locally or remotely)
- **PayPal** and **Braintree** sandbox accounts



const router = require("express").Router();
const { payment } = require("../controllers/payment.controller");

router.get("/", (req, res) => {
  res.send("Payment Gateway");
});

router.post("/process", payment);

module.exports = router;

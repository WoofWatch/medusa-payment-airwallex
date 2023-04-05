export default async (req, res) => {
  const { headers, body } = req;
  const ts = headers['x-timestamp'];
  const policy = `${ts}${body}`;

  const signature = req.headers["x-signature"]

  let event
  try {
    const airwallexProviderService = req.scope.resolve("pp_airwallex")
    
    event = airwallexProviderService.constructWebhookEvent(req.body, signature, policy)
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`)
    return
  }

  function isPaymentCollection(id) {
    return id && id.startsWith("paycol")
  }

  async function handleCartPayments(event, req, res, cartId) {
    const manager = req.scope.resolve("manager")
    const orderService = req.scope.resolve("orderService")

    const order = await orderService
      .retrieveByCartId(cartId)
      .catch(() => undefined)

    // handle payment intent events
    switch (event.name) {
      case "payment_intent.succeeded":
        if (order) {
          // If order is created but not captured, we attempt to do so
          if (order.payment_status !== "captured") {
            await manager.transaction(async (manager) => {
              await orderService
                .withTransaction(manager)
                .capturePayment(order.id)
            })
          } else {
            // Otherwise, respond with 200 preventing Stripe from retrying
            return res.sendStatus(200)
          }
        } else {
          // If order is not created, we respond with 404 to trigger Stripe retry mechanism
          return res.sendStatus(404)
        }
        break
      default:
        res.sendStatus(204)
        return
    }

    res.sendStatus(200)
  }

  async function handlePaymentCollection(event, req, res, id, paymentIntentId) {
    const manager = req.scope.resolve("manager")
    const paymentCollectionService = req.scope.resolve(
      "paymentCollectionService"
    )

    const paycol = await paymentCollectionService
      .retrieve(id, { relations: ["payments"] })
      .catch(() => undefined)

    if (paycol?.payments?.length) {
      if (event.type === "payment_intent.succeeded") {
        const payment = paycol.payments.find(
          (pay) => pay.data.id === paymentIntentId
        )
        if (payment && !payment.captured_at) {
          await manager.transaction(async (manager) => {
            await paymentCollectionService
              .withTransaction(manager)
              .capture(payment.id)
          })
        }

        res.sendStatus(200)
        return
      }
    }
    res.sendStatus(204)
  }

  const paymentIntent = event.data.object
  const cartId = paymentIntent.metadata.cart_id // Backward compatibility
  const resourceId = paymentIntent.metadata.resource_id

  if (isPaymentCollection(resourceId)) {
    await handlePaymentCollection(event, req, res, resourceId, paymentIntent.id)
  } else {
    await handleCartPayments(event, req, res, cartId ?? resourceId)
  }
}

async function paymentIntentAmountCapturableEventHandler({
  order,
  cartId,
  container,
  transactionManager,
}) {
  if (!order) {
    const cartService = container.resolve("cartService")
    const orderService = container.resolve("orderService")

    const cartServiceTx = cartService.withTransaction(transactionManager)
    await cartServiceTx.setPaymentSession(cartId, "stripe")
    await cartServiceTx.authorizePayment(cartId)
    await orderService
      .withTransaction(transactionManager)
      .createFromCart(cartId)
  }
}

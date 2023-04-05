import {
    AbstractPaymentService, PaymentSessionStatus
} from "@medusajs/medusa"
import axios from "axios"
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import * as dotenv from 'dotenv'
dotenv.config()

/**
 * Options
 * clientId: string;
 * apiKey: string;
 * capture: boolean;
 * apiEndpoint: string;
 * webhookSecret: string
 */


class AirwallexProviderService extends AbstractPaymentService {
    static identifier = "airwallex"

    /// "token to pass for API to create payment intent"
    /// Need to use cached token to prevent request token a lot
    bearer_token = ""

    constructor(_, options) {
        super(_, options)
        /**
         * Required airwallex options:
         *  {
         *    clientId: "airwallex client id", REQUIRED
         *    apiKey: "airwallex api key", REQUIRED
         *    // Use this flag to capture payment immediately (default is false)
         *    capture: true
         *    apiEndpoint
         *  }
         */
        this.options_ = options
    }

    async getToken() {
        if (this.bearer_token && this.bearer_token !== "") {
            return this.bearer_token;
        }

        try {
            const loginURL = `${this.options_.apiEndpoint}/api/v1/authentication/login`;
            const loginHeader = {
                "x-client-id": this.options_.clientId,
                "x-api-key": this.options_.apiKey,
                "Content-Type": "application/json",
            };
            const loginRes = await axios.post(
                loginURL,
                {},
                {
                    headers: loginHeader,
                }
            );
            const token = loginRes.data.token;
            this.bearer_token = token;
            // Cache token for a while
            setTimeout(() => (this.bearer_token = ""), 20 * 60 * 1000);
            return token;
        } catch (err) {
            console.log("Get Token");
            return ""
        }
    }

    async retrieveIntentData(data) {
        const { id } = data
        const retrieveIntentUrl = `${this.options_.apiEndpoint}/api/v1/pa/payment_intents/${id}`;
        try {
            // STEP #1: Before retrieve a intent, should get authorized token first.
            const token = await this.getToken();

            // STEP #2: Retrieve a paymentIntent by the intentId
            const intentRes = await axios.get(retrieveIntentUrl, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return intentRes.data;
        } catch (err) {
            // Handle api error here
            throw err
        }
    }

    async getPaymentData(paymentSession) {
        const { data } = paymentSession
        try {
            return await this.retrieveIntentData(data);
        } catch (err) {
            // Handle api error here
            throw err
        }
    }

    async updatePaymentData(paymentSessionData, _data) {
        return paymentSessionData
    }

    async createPayment(context) {
        try {
            const { id: cart_id, email, context: cart_context, currency_code, amount, resource_id, customer } = context
            console.log("Amount", amount);
            const intentRequest = {
                descriptor:
                    cart_context.payment_description ?? "",
                amount: Math.round(amount) / 100,
                currency: currency_code.toLocaleUpperCase(),
                request_id: uuidv4(),
                merchant_order_id: uuidv4(),
                metadata: { cart_id, resource_id },
                capture_method: this.options_.capture ? "automatic" : "manual",
                customer_id: null
            }
            const createIntentUrl = `${this.options_.apiEndpoint}/api/v1/pa/payment_intents/create`;
            const token = await this.getToken();
            if (!token || token === "") {
                throw new Error("GetToken issue.")
            }
            if (customer?.metadata?.airwallex_id) {
                intentRequest.customer_id = customer?.metadata?.airwallex_id
            } else {
                const createCustomerUrl = `${this.options_.apiEndpoint}/api/v1/pa/customers/create`;
                const airwallexCustomer = await axios.post(
                    createCustomerUrl,
                    JSON.stringify({
                        email,
                        request_id: uuidv4(),
                        merchant_customer_id: uuidv4()
                    }),
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                intentRequest.customer_id = airwallexCustomer.data.id;
            }

            const intentRes = await axios.post(
                createIntentUrl,
                JSON.stringify(intentRequest),
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return {
                session_data: intentRes.data,
                update_requests: customer?.metadata?.airwallex_id ? undefined : {
                    customer_metadata: {
                        airwallex_id: intentRequest.customer_id
                    }
                }
            }

        } catch (err) {
            console.log(err)
            throw new Error("CreatePayment has issue.")
        }
    }

    async retrievePayment(paymentData) {
        try {
            return await this.retrieveIntentData(paymentData);
        } catch (err) {
            // Handle api error here
            throw err
        }
    }

    async updatePayment(paymentSessionData, _cart) {
        return paymentSessionData
    }

    async authorizePayment(paymentSession, _context) {
        const stat = await this.getStatus(paymentSession.data)
        return { data: paymentSession.data, status: stat }
    }

    async capturePayment(payment) {
        const { id } = payment.data;
        const captureIntentUrl = `${this.options_.apiEndpoint}/api/v1/pa/payment_intents/${id}/capture`;
        try {
            const token = await this.getToken();

            const captureData = {
                "request_id": uuidv4()
            };
            const intentRes = await axios.post(
                captureIntentUrl,
                JSON.stringify(captureData),
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });
            return intentRes.data;
        } catch (error) {
            if (error.payment_intent.status === "SUCCEEDED") {
                return error.payment_intent
            }
            throw error
        }
    }

    async refundPayment(payment, refundAmount) {
        try {
            const { id } = payment.data
            const refundOrderUrl = `${this.options_.apiEndpoint}/api/v1/pa/refunds/create`;
            const token = await this.getToken();

            const refundRequestData = {
                amount: Math.round(refundAmount) / 100,
                metadata: {
                    id: 1
                },
                payment_attempt_id: "att_ps8e0ZgQzd2QnCxVpzJrHD6KOVu",
                payment_intent_id: id,
                reason: "Return good",
                request_id: uuidv4()
            }
            await axios.post(
                refundOrderUrl,
                JSON.stringify(refundRequestData),
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            return payment.data
        } catch (err) {
            throw err
        }
    }

    async cancelPayment(payment) {
        const { id } = payment.data
        try {
            const cancelOrderUrl = `${this.options_.apiEndpoint}/api/v1/pa/payment_intents/${id}/cancel`;

            const token = await this.getToken();
            if (!token || token === "") {
                throw new Error("GetToken issue.")
            }

            return await axios.post(
                cancelOrderUrl,
                JSON.stringify({
                    "cancellation_reason": "Order cancelled",
                    request_id: uuidv4(),
                }),
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
        } catch (error) {
            console.log(error)
            if (error.payment_intent.status === "CANCELLED") {
                return error.payment_intent
            }
            throw error
        }
    }
    async deletePayment(paymentSession) {
        const { id } = paymentSession.data
        try {
            const cancelOrderUrl = `${this.options_.apiEndpoint}/api/v1/pa/payment_intents/${id}/cancel`;

            const token = await this.getToken();
            if (!token || token === "") {
                throw new Error("GetToken issue.")
            }

            await axios.post(
                cancelOrderUrl,
                JSON.stringify({
                    "cancellation_reason": "Order cancelled",
                    request_id: uuidv4(),
                }),
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
        } catch (err) {
            console.log(err)
            throw new Error("DeletePayment issue.")
        }
    }
    async getStatus(data) {
        try {
            // STEP #1: Before retrieve a intent, should get authorized token first.
            const intentResData = await this.retrieveIntentData(data);

            switch (intentResData.status) {
                case "REQUIRES_PAYMENT_METHOD":
                case "PENDING":
                    return PaymentSessionStatus.PENDING
                case "REQUIRES_CUSTOMER_ACTION":
                    return PaymentSessionStatus.REQUIRES_MORE
                case "CANCELLED":
                    return PaymentSessionStatus.CANCELED
                case "REQUIRES_CAPTURE":
                case "SUCCEEDED":
                    return PaymentSessionStatus.AUTHORIZED
                default:
                    return PaymentSessionStatus.PENDING
            }
        } catch (err) {
            // Handle api error here
            return PaymentSessionStatus.PENDING
        }
    }


    /**
     * Constructs Stripe Webhook event
     * @param {object} data - the data of the webhook request: req.body
     * @param {object} signature - the Stripe signature on the event, that
     *    ensures integrity of the webhook event
     * @return {object} Stripe Webhook event
     */
    constructWebhookEvent(data, signature, policy) {
        const secret = this.options_.webhookSecret;
        const signatureHex = crypto.createHmac('sha256', secret).update(policy).digest('hex');
        if (signatureHex === signature) {
            return data;
        } else {
            throw new Error("failed to verify webhook signature.")
        }
    }
}

export default AirwallexProviderService
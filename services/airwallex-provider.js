"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _typeof = require("@babel/runtime/helpers/typeof");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));
var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));
var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));
var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));
var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));
var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _medusa = require("@medusajs/medusa");
var _axios = _interopRequireDefault(require("axios"));
var _uuid = require("uuid");
var _crypto = _interopRequireDefault(require("crypto"));
var dotenv = _interopRequireWildcard(require("dotenv"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
dotenv.config();

/**
 * Options
 * clientId: string;
 * apiKey: string;
 * capture: boolean;
 * apiEndpoint: string;
 * webhookSecret: string
 */
var AirwallexProviderService = /*#__PURE__*/function (_AbstractPaymentServi) {
  (0, _inherits2["default"])(AirwallexProviderService, _AbstractPaymentServi);
  var _super = _createSuper(AirwallexProviderService);
  /// "token to pass for API to create payment intent"
  /// Need to use cached token to prevent request token a lot

  function AirwallexProviderService(_, options) {
    var _this;
    (0, _classCallCheck2["default"])(this, AirwallexProviderService);
    _this = _super.call(this, _, options);
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
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "bearer_token", "");
    _this.options_ = options;
    return _this;
  }
  (0, _createClass2["default"])(AirwallexProviderService, [{
    key: "getToken",
    value: function () {
      var _getToken = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
        var _this2 = this;
        var loginURL, loginHeader, loginRes, token;
        return _regenerator["default"].wrap(function _callee$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              if (!(this.bearer_token && this.bearer_token !== "")) {
                _context2.next = 2;
                break;
              }
              return _context2.abrupt("return", this.bearer_token);
            case 2:
              _context2.prev = 2;
              loginURL = "".concat(this.options_.apiEndpoint, "/api/v1/authentication/login");
              loginHeader = {
                "x-client-id": this.options_.clientId,
                "x-api-key": this.options_.apiKey,
                "Content-Type": "application/json"
              };
              _context2.next = 7;
              return _axios["default"].post(loginURL, {}, {
                headers: loginHeader
              });
            case 7:
              loginRes = _context2.sent;
              token = loginRes.data.token;
              this.bearer_token = token;
              // Cache token for a while
              setTimeout(function () {
                return _this2.bearer_token = "";
              }, 20 * 60 * 1000);
              return _context2.abrupt("return", token);
            case 14:
              _context2.prev = 14;
              _context2.t0 = _context2["catch"](2);
              console.log("Get Token");
              return _context2.abrupt("return", "");
            case 18:
            case "end":
              return _context2.stop();
          }
        }, _callee, this, [[2, 14]]);
      }));
      function getToken() {
        return _getToken.apply(this, arguments);
      }
      return getToken;
    }()
  }, {
    key: "retrieveIntentData",
    value: function () {
      var _retrieveIntentData = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(data) {
        var id, retrieveIntentUrl, token, intentRes;
        return _regenerator["default"].wrap(function _callee2$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              id = data.id;
              retrieveIntentUrl = "".concat(this.options_.apiEndpoint, "/api/v1/pa/payment_intents/").concat(id);
              _context3.prev = 2;
              _context3.next = 5;
              return this.getToken();
            case 5:
              token = _context3.sent;
              _context3.next = 8;
              return _axios["default"].get(retrieveIntentUrl, {
                headers: {
                  Authorization: "Bearer ".concat(token)
                }
              });
            case 8:
              intentRes = _context3.sent;
              return _context3.abrupt("return", intentRes.data);
            case 12:
              _context3.prev = 12;
              _context3.t0 = _context3["catch"](2);
              throw _context3.t0;
            case 15:
            case "end":
              return _context3.stop();
          }
        }, _callee2, this, [[2, 12]]);
      }));
      function retrieveIntentData(_x) {
        return _retrieveIntentData.apply(this, arguments);
      }
      return retrieveIntentData;
    }()
  }, {
    key: "getPaymentData",
    value: function () {
      var _getPaymentData = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(paymentSession) {
        var data;
        return _regenerator["default"].wrap(function _callee3$(_context4) {
          while (1) switch (_context4.prev = _context4.next) {
            case 0:
              data = paymentSession.data;
              _context4.prev = 1;
              _context4.next = 4;
              return this.retrieveIntentData(data);
            case 4:
              return _context4.abrupt("return", _context4.sent);
            case 7:
              _context4.prev = 7;
              _context4.t0 = _context4["catch"](1);
              throw _context4.t0;
            case 10:
            case "end":
              return _context4.stop();
          }
        }, _callee3, this, [[1, 7]]);
      }));
      function getPaymentData(_x2) {
        return _getPaymentData.apply(this, arguments);
      }
      return getPaymentData;
    }()
  }, {
    key: "updatePaymentData",
    value: function () {
      var _updatePaymentData = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(paymentSessionData, _data) {
        return _regenerator["default"].wrap(function _callee4$(_context5) {
          while (1) switch (_context5.prev = _context5.next) {
            case 0:
              return _context5.abrupt("return", paymentSessionData);
            case 1:
            case "end":
              return _context5.stop();
          }
        }, _callee4);
      }));
      function updatePaymentData(_x3, _x4) {
        return _updatePaymentData.apply(this, arguments);
      }
      return updatePaymentData;
    }()
  }, {
    key: "createPayment",
    value: function () {
      var _createPayment = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(context) {
        var _cart_context$payment, _customer$metadata, _customer$metadata3, cart_id, email, cart_context, currency_code, amount, resource_id, customer, intentRequest, createIntentUrl, token, _customer$metadata2, createCustomerUrl, airwallexCustomer, intentRes;
        return _regenerator["default"].wrap(function _callee5$(_context6) {
          while (1) switch (_context6.prev = _context6.next) {
            case 0:
              _context6.prev = 0;
              cart_id = context.id, email = context.email, cart_context = context.context, currency_code = context.currency_code, amount = context.amount, resource_id = context.resource_id, customer = context.customer;
              console.log("Amount", amount);
              intentRequest = {
                descriptor: (_cart_context$payment = cart_context.payment_description) !== null && _cart_context$payment !== void 0 ? _cart_context$payment : "",
                amount: Math.round(amount) / 100,
                currency: currency_code.toLocaleUpperCase(),
                request_id: (0, _uuid.v4)(),
                merchant_order_id: (0, _uuid.v4)(),
                metadata: {
                  cart_id: cart_id,
                  resource_id: resource_id
                },
                capture_method: this.options_.capture ? "automatic" : "manual",
                customer_id: null
              };
              createIntentUrl = "".concat(this.options_.apiEndpoint, "/api/v1/pa/payment_intents/create");
              _context6.next = 7;
              return this.getToken();
            case 7:
              token = _context6.sent;
              if (!(!token || token === "")) {
                _context6.next = 10;
                break;
              }
              throw new Error("GetToken issue.");
            case 10:
              if (!(customer !== null && customer !== void 0 && (_customer$metadata = customer.metadata) !== null && _customer$metadata !== void 0 && _customer$metadata.airwallex_id)) {
                _context6.next = 14;
                break;
              }
              intentRequest.customer_id = customer === null || customer === void 0 ? void 0 : (_customer$metadata2 = customer.metadata) === null || _customer$metadata2 === void 0 ? void 0 : _customer$metadata2.airwallex_id;
              _context6.next = 19;
              break;
            case 14:
              createCustomerUrl = "".concat(this.options_.apiEndpoint, "/api/v1/pa/customers/create");
              _context6.next = 17;
              return _axios["default"].post(createCustomerUrl, JSON.stringify({
                email: email,
                request_id: (0, _uuid.v4)(),
                merchant_customer_id: (0, _uuid.v4)()
              }), {
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: "Bearer ".concat(token)
                }
              });
            case 17:
              airwallexCustomer = _context6.sent;
              intentRequest.customer_id = airwallexCustomer.data.id;
            case 19:
              _context6.next = 21;
              return _axios["default"].post(createIntentUrl, JSON.stringify(intentRequest), {
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: "Bearer ".concat(token)
                }
              });
            case 21:
              intentRes = _context6.sent;
              return _context6.abrupt("return", {
                session_data: intentRes.data,
                update_requests: customer !== null && customer !== void 0 && (_customer$metadata3 = customer.metadata) !== null && _customer$metadata3 !== void 0 && _customer$metadata3.airwallex_id ? undefined : {
                  customer_metadata: {
                    airwallex_id: intentRequest.customer_id
                  }
                }
              });
            case 25:
              _context6.prev = 25;
              _context6.t0 = _context6["catch"](0);
              console.log(_context6.t0);
              throw new Error("CreatePayment has issue.");
            case 29:
            case "end":
              return _context6.stop();
          }
        }, _callee5, this, [[0, 25]]);
      }));
      function createPayment(_x5) {
        return _createPayment.apply(this, arguments);
      }
      return createPayment;
    }()
  }, {
    key: "retrievePayment",
    value: function () {
      var _retrievePayment = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6(paymentData) {
        return _regenerator["default"].wrap(function _callee6$(_context7) {
          while (1) switch (_context7.prev = _context7.next) {
            case 0:
              _context7.prev = 0;
              _context7.next = 3;
              return this.retrieveIntentData(paymentData);
            case 3:
              return _context7.abrupt("return", _context7.sent);
            case 6:
              _context7.prev = 6;
              _context7.t0 = _context7["catch"](0);
              throw _context7.t0;
            case 9:
            case "end":
              return _context7.stop();
          }
        }, _callee6, this, [[0, 6]]);
      }));
      function retrievePayment(_x6) {
        return _retrievePayment.apply(this, arguments);
      }
      return retrievePayment;
    }()
  }, {
    key: "updatePayment",
    value: function () {
      var _updatePayment = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee7(paymentSessionData, _cart) {
        return _regenerator["default"].wrap(function _callee7$(_context8) {
          while (1) switch (_context8.prev = _context8.next) {
            case 0:
              return _context8.abrupt("return", paymentSessionData);
            case 1:
            case "end":
              return _context8.stop();
          }
        }, _callee7);
      }));
      function updatePayment(_x7, _x8) {
        return _updatePayment.apply(this, arguments);
      }
      return updatePayment;
    }()
  }, {
    key: "authorizePayment",
    value: function () {
      var _authorizePayment = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee8(paymentSession, _context) {
        var stat;
        return _regenerator["default"].wrap(function _callee8$(_context9) {
          while (1) switch (_context9.prev = _context9.next) {
            case 0:
              _context9.next = 2;
              return this.getStatus(paymentSession.data);
            case 2:
              stat = _context9.sent;
              return _context9.abrupt("return", {
                data: paymentSession.data,
                status: stat
              });
            case 4:
            case "end":
              return _context9.stop();
          }
        }, _callee8, this);
      }));
      function authorizePayment(_x9, _x10) {
        return _authorizePayment.apply(this, arguments);
      }
      return authorizePayment;
    }()
  }, {
    key: "capturePayment",
    value: function () {
      var _capturePayment = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee9(payment) {
        var id, captureIntentUrl, token, captureData, intentRes;
        return _regenerator["default"].wrap(function _callee9$(_context10) {
          while (1) switch (_context10.prev = _context10.next) {
            case 0:
              id = payment.data.id;
              captureIntentUrl = "".concat(this.options_.apiEndpoint, "/api/v1/pa/payment_intents/").concat(id, "/capture");
              _context10.prev = 2;
              _context10.next = 5;
              return this.getToken();
            case 5:
              token = _context10.sent;
              captureData = {
                "request_id": (0, _uuid.v4)()
              };
              _context10.next = 9;
              return _axios["default"].post(captureIntentUrl, JSON.stringify(captureData), {
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: "Bearer ".concat(token)
                }
              });
            case 9:
              intentRes = _context10.sent;
              return _context10.abrupt("return", intentRes.data);
            case 13:
              _context10.prev = 13;
              _context10.t0 = _context10["catch"](2);
              if (!(_context10.t0.payment_intent.status === "SUCCEEDED")) {
                _context10.next = 17;
                break;
              }
              return _context10.abrupt("return", _context10.t0.payment_intent);
            case 17:
              throw _context10.t0;
            case 18:
            case "end":
              return _context10.stop();
          }
        }, _callee9, this, [[2, 13]]);
      }));
      function capturePayment(_x11) {
        return _capturePayment.apply(this, arguments);
      }
      return capturePayment;
    }()
  }, {
    key: "refundPayment",
    value: function () {
      var _refundPayment = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee10(payment, refundAmount) {
        var id, refundOrderUrl, token, refundRequestData;
        return _regenerator["default"].wrap(function _callee10$(_context11) {
          while (1) switch (_context11.prev = _context11.next) {
            case 0:
              _context11.prev = 0;
              id = payment.data.id;
              refundOrderUrl = "".concat(this.options_.apiEndpoint, "/api/v1/pa/refunds/create");
              _context11.next = 5;
              return this.getToken();
            case 5:
              token = _context11.sent;
              refundRequestData = {
                amount: Math.round(refundAmount) / 100,
                metadata: {
                  id: 1
                },
                payment_attempt_id: "att_ps8e0ZgQzd2QnCxVpzJrHD6KOVu",
                payment_intent_id: id,
                reason: "Return good",
                request_id: (0, _uuid.v4)()
              };
              _context11.next = 9;
              return _axios["default"].post(refundOrderUrl, JSON.stringify(refundRequestData), {
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: "Bearer ".concat(token)
                }
              });
            case 9:
              return _context11.abrupt("return", payment.data);
            case 12:
              _context11.prev = 12;
              _context11.t0 = _context11["catch"](0);
              throw _context11.t0;
            case 15:
            case "end":
              return _context11.stop();
          }
        }, _callee10, this, [[0, 12]]);
      }));
      function refundPayment(_x12, _x13) {
        return _refundPayment.apply(this, arguments);
      }
      return refundPayment;
    }()
  }, {
    key: "cancelPayment",
    value: function () {
      var _cancelPayment = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee11(payment) {
        var id, cancelOrderUrl, token;
        return _regenerator["default"].wrap(function _callee11$(_context12) {
          while (1) switch (_context12.prev = _context12.next) {
            case 0:
              id = payment.data.id;
              _context12.prev = 1;
              cancelOrderUrl = "".concat(this.options_.apiEndpoint, "/api/v1/pa/payment_intents/").concat(id, "/cancel");
              _context12.next = 5;
              return this.getToken();
            case 5:
              token = _context12.sent;
              if (!(!token || token === "")) {
                _context12.next = 8;
                break;
              }
              throw new Error("GetToken issue.");
            case 8:
              _context12.next = 10;
              return _axios["default"].post(cancelOrderUrl, JSON.stringify({
                "cancellation_reason": "Order cancelled",
                request_id: (0, _uuid.v4)()
              }), {
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: "Bearer ".concat(token)
                }
              });
            case 10:
              return _context12.abrupt("return", _context12.sent);
            case 13:
              _context12.prev = 13;
              _context12.t0 = _context12["catch"](1);
              console.log(_context12.t0);
              if (!(_context12.t0.payment_intent.status === "CANCELLED")) {
                _context12.next = 18;
                break;
              }
              return _context12.abrupt("return", _context12.t0.payment_intent);
            case 18:
              throw _context12.t0;
            case 19:
            case "end":
              return _context12.stop();
          }
        }, _callee11, this, [[1, 13]]);
      }));
      function cancelPayment(_x14) {
        return _cancelPayment.apply(this, arguments);
      }
      return cancelPayment;
    }()
  }, {
    key: "deletePayment",
    value: function () {
      var _deletePayment = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee12(paymentSession) {
        var id, cancelOrderUrl, token;
        return _regenerator["default"].wrap(function _callee12$(_context13) {
          while (1) switch (_context13.prev = _context13.next) {
            case 0:
              id = paymentSession.data.id;
              _context13.prev = 1;
              cancelOrderUrl = "".concat(this.options_.apiEndpoint, "/api/v1/pa/payment_intents/").concat(id, "/cancel");
              _context13.next = 5;
              return this.getToken();
            case 5:
              token = _context13.sent;
              if (!(!token || token === "")) {
                _context13.next = 8;
                break;
              }
              throw new Error("GetToken issue.");
            case 8:
              _context13.next = 10;
              return _axios["default"].post(cancelOrderUrl, JSON.stringify({
                "cancellation_reason": "Order cancelled",
                request_id: (0, _uuid.v4)()
              }), {
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: "Bearer ".concat(token)
                }
              });
            case 10:
              _context13.next = 16;
              break;
            case 12:
              _context13.prev = 12;
              _context13.t0 = _context13["catch"](1);
              console.log(_context13.t0);
              throw new Error("DeletePayment issue.");
            case 16:
            case "end":
              return _context13.stop();
          }
        }, _callee12, this, [[1, 12]]);
      }));
      function deletePayment(_x15) {
        return _deletePayment.apply(this, arguments);
      }
      return deletePayment;
    }()
  }, {
    key: "getStatus",
    value: function () {
      var _getStatus = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee13(data) {
        var intentResData;
        return _regenerator["default"].wrap(function _callee13$(_context14) {
          while (1) switch (_context14.prev = _context14.next) {
            case 0:
              _context14.prev = 0;
              _context14.next = 3;
              return this.retrieveIntentData(data);
            case 3:
              intentResData = _context14.sent;
              _context14.t0 = intentResData.status;
              _context14.next = _context14.t0 === "REQUIRES_PAYMENT_METHOD" ? 7 : _context14.t0 === "PENDING" ? 7 : _context14.t0 === "REQUIRES_CUSTOMER_ACTION" ? 8 : _context14.t0 === "CANCELLED" ? 9 : _context14.t0 === "REQUIRES_CAPTURE" ? 10 : _context14.t0 === "SUCCEEDED" ? 10 : 11;
              break;
            case 7:
              return _context14.abrupt("return", _medusa.PaymentSessionStatus.PENDING);
            case 8:
              return _context14.abrupt("return", _medusa.PaymentSessionStatus.REQUIRES_MORE);
            case 9:
              return _context14.abrupt("return", _medusa.PaymentSessionStatus.CANCELED);
            case 10:
              return _context14.abrupt("return", _medusa.PaymentSessionStatus.AUTHORIZED);
            case 11:
              return _context14.abrupt("return", _medusa.PaymentSessionStatus.PENDING);
            case 12:
              _context14.next = 17;
              break;
            case 14:
              _context14.prev = 14;
              _context14.t1 = _context14["catch"](0);
              return _context14.abrupt("return", _medusa.PaymentSessionStatus.PENDING);
            case 17:
            case "end":
              return _context14.stop();
          }
        }, _callee13, this, [[0, 14]]);
      }));
      function getStatus(_x16) {
        return _getStatus.apply(this, arguments);
      }
      return getStatus;
    }()
    /**
     * Constructs Stripe Webhook event
     * @param {object} data - the data of the webhook request: req.body
     * @param {object} signature - the Stripe signature on the event, that
     *    ensures integrity of the webhook event
     * @return {object} Stripe Webhook event
     */
  }, {
    key: "constructWebhookEvent",
    value: function constructWebhookEvent(data, signature, policy) {
      var secret = this.options_.webhookSecret;
      var signatureHex = _crypto["default"].createHmac('sha256', secret).update(policy).digest('hex');
      if (signatureHex === signature) {
        return data;
      } else {
        throw new Error("failed to verify webhook signature.");
      }
    }
  }]);
  return AirwallexProviderService;
}(_medusa.AbstractPaymentService);
(0, _defineProperty2["default"])(AirwallexProviderService, "identifier", "airwallex");
var _default = AirwallexProviderService;
exports["default"] = _default;
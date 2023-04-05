"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _default = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(req, res) {
    var headers, body, ts, policy, signature, event, airwallexProviderService, isPaymentCollection, handleCartPayments, _handleCartPayments, handlePaymentCollection, _handlePaymentCollection, paymentIntent, cartId, resourceId;
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          _handlePaymentCollection = function _handlePaymentCollect2() {
            _handlePaymentCollection = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(event, req, res, id, paymentIntentId) {
              var _paycol$payments;
              var manager, paymentCollectionService, paycol, payment;
              return _regenerator["default"].wrap(function _callee4$(_context4) {
                while (1) switch (_context4.prev = _context4.next) {
                  case 0:
                    manager = req.scope.resolve("manager");
                    paymentCollectionService = req.scope.resolve("paymentCollectionService");
                    _context4.next = 4;
                    return paymentCollectionService.retrieve(id, {
                      relations: ["payments"]
                    })["catch"](function () {
                      return undefined;
                    });
                  case 4:
                    paycol = _context4.sent;
                    if (!(paycol !== null && paycol !== void 0 && (_paycol$payments = paycol.payments) !== null && _paycol$payments !== void 0 && _paycol$payments.length)) {
                      _context4.next = 13;
                      break;
                    }
                    if (!(event.type === "payment_intent.succeeded")) {
                      _context4.next = 13;
                      break;
                    }
                    payment = paycol.payments.find(function (pay) {
                      return pay.data.id === paymentIntentId;
                    });
                    if (!(payment && !payment.captured_at)) {
                      _context4.next = 11;
                      break;
                    }
                    _context4.next = 11;
                    return manager.transaction( /*#__PURE__*/function () {
                      var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(manager) {
                        return _regenerator["default"].wrap(function _callee3$(_context3) {
                          while (1) switch (_context3.prev = _context3.next) {
                            case 0:
                              _context3.next = 2;
                              return paymentCollectionService.withTransaction(manager).capture(payment.id);
                            case 2:
                            case "end":
                              return _context3.stop();
                          }
                        }, _callee3);
                      }));
                      return function (_x13) {
                        return _ref3.apply(this, arguments);
                      };
                    }());
                  case 11:
                    res.sendStatus(200);
                    return _context4.abrupt("return");
                  case 13:
                    res.sendStatus(204);
                  case 14:
                  case "end":
                    return _context4.stop();
                }
              }, _callee4);
            }));
            return _handlePaymentCollection.apply(this, arguments);
          };
          handlePaymentCollection = function _handlePaymentCollect(_x7, _x8, _x9, _x10, _x11) {
            return _handlePaymentCollection.apply(this, arguments);
          };
          _handleCartPayments = function _handleCartPayments3() {
            _handleCartPayments = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(event, req, res, cartId) {
              var manager, orderService, order;
              return _regenerator["default"].wrap(function _callee2$(_context2) {
                while (1) switch (_context2.prev = _context2.next) {
                  case 0:
                    manager = req.scope.resolve("manager");
                    orderService = req.scope.resolve("orderService");
                    _context2.next = 4;
                    return orderService.retrieveByCartId(cartId)["catch"](function () {
                      return undefined;
                    });
                  case 4:
                    order = _context2.sent;
                    _context2.t0 = event.name;
                    _context2.next = _context2.t0 === "payment_intent.succeeded" ? 8 : 19;
                    break;
                  case 8:
                    if (!order) {
                      _context2.next = 17;
                      break;
                    }
                    if (!(order.payment_status !== "captured")) {
                      _context2.next = 14;
                      break;
                    }
                    _context2.next = 12;
                    return manager.transaction( /*#__PURE__*/function () {
                      var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(manager) {
                        return _regenerator["default"].wrap(function _callee$(_context) {
                          while (1) switch (_context.prev = _context.next) {
                            case 0:
                              _context.next = 2;
                              return orderService.withTransaction(manager).capturePayment(order.id);
                            case 2:
                            case "end":
                              return _context.stop();
                          }
                        }, _callee);
                      }));
                      return function (_x12) {
                        return _ref2.apply(this, arguments);
                      };
                    }());
                  case 12:
                    _context2.next = 15;
                    break;
                  case 14:
                    return _context2.abrupt("return", res.sendStatus(200));
                  case 15:
                    _context2.next = 18;
                    break;
                  case 17:
                    return _context2.abrupt("return", res.sendStatus(404));
                  case 18:
                    return _context2.abrupt("break", 21);
                  case 19:
                    res.sendStatus(204);
                    return _context2.abrupt("return");
                  case 21:
                    res.sendStatus(200);
                  case 22:
                  case "end":
                    return _context2.stop();
                }
              }, _callee2);
            }));
            return _handleCartPayments.apply(this, arguments);
          };
          handleCartPayments = function _handleCartPayments2(_x3, _x4, _x5, _x6) {
            return _handleCartPayments.apply(this, arguments);
          };
          isPaymentCollection = function _isPaymentCollection(id) {
            return id && id.startsWith("paycol");
          };
          headers = req.headers, body = req.body;
          ts = headers['x-timestamp'];
          policy = "".concat(ts).concat(body);
          signature = req.headers["x-signature"];
          _context5.prev = 9;
          airwallexProviderService = req.scope.resolve("pp_airwallex");
          event = airwallexProviderService.constructWebhookEvent(req.body, signature, policy);
          _context5.next = 18;
          break;
        case 14:
          _context5.prev = 14;
          _context5.t0 = _context5["catch"](9);
          res.status(400).send("Webhook Error: ".concat(_context5.t0.message));
          return _context5.abrupt("return");
        case 18:
          paymentIntent = event.data.object;
          cartId = paymentIntent.metadata.cart_id; // Backward compatibility
          resourceId = paymentIntent.metadata.resource_id;
          if (!isPaymentCollection(resourceId)) {
            _context5.next = 26;
            break;
          }
          _context5.next = 24;
          return handlePaymentCollection(event, req, res, resourceId, paymentIntent.id);
        case 24:
          _context5.next = 28;
          break;
        case 26:
          _context5.next = 28;
          return handleCartPayments(event, req, res, cartId !== null && cartId !== void 0 ? cartId : resourceId);
        case 28:
        case "end":
          return _context5.stop();
      }
    }, _callee5, null, [[9, 14]]);
  }));
  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();
exports["default"] = _default;
function paymentIntentAmountCapturableEventHandler(_x14) {
  return _paymentIntentAmountCapturableEventHandler.apply(this, arguments);
}
function _paymentIntentAmountCapturableEventHandler() {
  _paymentIntentAmountCapturableEventHandler = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6(_ref4) {
    var order, cartId, container, transactionManager, cartService, orderService, cartServiceTx;
    return _regenerator["default"].wrap(function _callee6$(_context6) {
      while (1) switch (_context6.prev = _context6.next) {
        case 0:
          order = _ref4.order, cartId = _ref4.cartId, container = _ref4.container, transactionManager = _ref4.transactionManager;
          if (order) {
            _context6.next = 11;
            break;
          }
          cartService = container.resolve("cartService");
          orderService = container.resolve("orderService");
          cartServiceTx = cartService.withTransaction(transactionManager);
          _context6.next = 7;
          return cartServiceTx.setPaymentSession(cartId, "stripe");
        case 7:
          _context6.next = 9;
          return cartServiceTx.authorizePayment(cartId);
        case 9:
          _context6.next = 11;
          return orderService.withTransaction(transactionManager).createFromCart(cartId);
        case 11:
        case "end":
          return _context6.stop();
      }
    }, _callee6);
  }));
  return _paymentIntentAmountCapturableEventHandler.apply(this, arguments);
}
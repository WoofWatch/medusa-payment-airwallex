"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _express = require("express");
var _bodyParser = _interopRequireDefault(require("body-parser"));
var _middlewares = _interopRequireDefault(require("../../middlewares"));
var route = (0, _express.Router)();
var _default = function _default(app) {
  app.use("/airwallex", route);
  route.use(_bodyParser["default"].json());
  route.post("/hooks", _middlewares["default"].wrap(require("./airwallex")["default"]));
  return app;
};
exports["default"] = _default;
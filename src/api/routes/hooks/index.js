import { Router } from "express"
import bodyParser from "body-parser"
import middlewares from "../../middlewares"

const route = Router()

export default (app) => {
  app.use("/airwallex", route)

  route.use(bodyParser.json())
  route.post("/hooks", middlewares.wrap(require("./airwallex").default))
  return app
}

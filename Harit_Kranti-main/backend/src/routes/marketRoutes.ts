import { Router, Request, Response } from "express";
import { getMarketPricesForState } from "../services/marketPricesService";

const router = Router();

router.get("/prices", async (req: Request, res: Response, next) => {
  try {
    const raw = req.query.state;
    const state = typeof raw === "string" && raw.trim() ? raw.trim() : "Uttar Pradesh";
    const data = await getMarketPricesForState(state);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;

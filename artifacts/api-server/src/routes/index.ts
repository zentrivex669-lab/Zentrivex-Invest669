import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import plansRouter from "./plans";
import investmentsRouter from "./investments";
import depositsRouter from "./deposits";
import withdrawalsRouter from "./withdrawals";
import kycRouter from "./kyc";
import dashboardRouter from "./dashboard";
import settingsRouter from "./settings";
import referralsRouter from "./referrals";
import cronRouter from "./cron";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(plansRouter);
router.use(investmentsRouter);
router.use(depositsRouter);
router.use(withdrawalsRouter);
router.use(kycRouter);
router.use(dashboardRouter);
router.use(settingsRouter);
router.use(referralsRouter);
router.use(cronRouter);

export default router;

import { postRouter } from "~/server/api/routers/post";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { transfersRouter } from "~/server/api/routers/transfers";
import { userRouter } from "~/server/api/routers/user";
import { billsRouter } from "~/server/api/routers/bills";
import { stellarRouter } from "~/server/api/routers/stellar";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  transfers: transfersRouter,
  users: userRouter,
  bills: billsRouter,
  stellar: stellarRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);

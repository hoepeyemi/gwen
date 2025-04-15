import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { type NextRequest } from "next/server";

import { env } from "~/env";
import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a HTTP request (e.g. when you make requests from Client Components).
 */
const createContext = async (req: NextRequest) => {
  return createTRPCContext({
    headers: req.headers,
  });
};

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContext(req),
    onError:
      env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`,
              error.cause || ""
            );
          }
        : undefined,
    responseMeta: () => {
      // Set proper content type for all responses
      return {
        headers: {
          "content-type": "application/json",
        },
      };
    },
  }).catch(error => {
    // Catch any handler errors and return a proper JSON response
    console.error("Unhandled API error:", error);
    return new Response(
      JSON.stringify({
        message: "An unexpected error occurred",
        success: false,
      }),
      {
        status: 500,
        headers: {
          "content-type": "application/json",
        },
      }
    );
  });

export { handler as GET, handler as POST };

// backend/src/index.ts
import Fastify from "fastify";
import cors from "@fastify/cors";
import * as dotenv from "dotenv";
import {
  searchRestaurants,
  getRestaurantDetails,
  fetchPhotoV1,
} from "./places";

dotenv.config();

// Fail fast if no API key
if (!process.env.GOOGLE_MAPS_API_KEY) {
  console.error("❌ Missing GOOGLE_MAPS_API_KEY in backend/.env");
  process.exit(1);
}

const PORT = Number(process.env.PORT ?? 4000);
const server = Fastify({ logger: true });

async function start() {
  try {
    // Allow frontend to call backend (local dev + Docker)
    await server.register(cors, {
      origin: [
        "http://localhost:5173", // Vite dev
        "http://127.0.0.1:5173",
        "http://localhost:3000", // Docker frontend
        "http://127.0.0.1:3000",
      ],
    });

    // Healthcheck
    server.get("/health", async () => ({ ok: true }));

    /**
     * GET /restaurants
     * Query params: q, radius, limit, page, minRating
     */
    server.get<{
      Querystring: {
        q?: string;
        radius?: string;
        limit?: string;
        page?: string;
        minRating?: string;
      };
    }>("/restaurants", async (req, reply) => {
      try {
        const { q, limit, page, minRating } = req.query;

        const data = await searchRestaurants({
          q,
          limit: limit ? Number(limit) : undefined,
          page: page ? Number(page) : undefined,
        });

        const filtered =
          minRating !== undefined
            ? data.filter((r) => (r.rating ?? 0) >= Number(minRating))
            : data;

        return filtered;
      } catch (err: any) {
        req.log.error(err);
        reply.code(500).send({
          error: err?.message ?? "Search failed",
        });
      }
    });

    /**
     * GET /restaurants/:placeId
     */
    server.get<{ Params: { placeId: string } }>(
      "/restaurants/:placeId",
      async (req, reply) => {
        try {
          const data = await getRestaurantDetails(req.params.placeId);
          return data;
        } catch (err: any) {
          req.log.error(err);
          reply.code(500).send({
            error: err?.message ?? "Details failed",
            hint:
              "Check billing, Places API (New) enabled, and key restrictions.",
          });
        }
      }
    );

    /**
     * GET /photos/v1/:photoNameEncoded?maxwidth=400
     */
    server.get<{
      Querystring: { maxwidth?: string };
    }>("/photos/v1/*", async (req, reply) => {
      try {
        const maxwidth = req.query.maxwidth
          ? Number(req.query.maxwidth)
          : 400;

        const encodedName = (req.params as any)["*"];
        const photoName = decodeURIComponent(encodedName);

        const resp = await fetchPhotoV1(photoName, maxwidth);

        resp.headers.forEach((value, key) => {
          if (key.toLowerCase() === "content-length") return;
          reply.header(key, value);
        });

        const buffer = Buffer.from(await resp.arrayBuffer());
        reply.status(resp.status).send(buffer);
      } catch (err: any) {
        req.log.error(err);
        reply
          .code(500)
          .send({ error: err?.message ?? "Photo fetch failed" });
      }
    });

    // Start server
    await server.listen({ port: PORT, host: "0.0.0.0" });
    server.log.info(` API listening on http://localhost:${PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();

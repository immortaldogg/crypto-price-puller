import { fetchOHLCV } from "./fetchOHLCV";
import { describe, it, expect } from "vitest";

describe("fetchOHLCV", () => {
    it("pulls recent candles from Binance", async () => {
        const start = new Date("2024-01-01T00:00:00Z").getTime();
        const end = start + 10 * 24 * 60 * 60 * 1000;
        const data = await fetchOHLCV("BTCUSDT", start, end);
        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBeGreaterThan(0);
        expect(data[0]).toHaveLength(12); // Binance kline structure
    });

    it("handles bad symbol gracefully", async () => {
        const data = await fetchOHLCV("BADCOINUSDT", Date.now(), Date.now());
        expect(data).toEqual([]); // returns empty array on failure
    });
});

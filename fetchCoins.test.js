import { getTopCoins } from "./fetchCoins";
import { describe, it, expect } from "vitest";

describe("getTopCoins", () => {
    it("excludes stablecoins and returns ~200 items", async () => {
        const coins = await getTopCoins();
        expect(coins.length).toBeGreaterThan(150); // some will be filtered
        expect(coins.find(c => c.symbol === "USDT")).toBeUndefined();
        expect(coins[0]).toHaveProperty("binanceSymbol");
    });
});

import { FILTER_OUT_STABLES, FILTER_OUT_STAKES } from "./config";
import { getTopCoins } from "./fetchCoins";
import { describe, it, expect } from "vitest";

describe("getTopCoins", () => {
    it("excludes stablecoins and returns ~200 items", async () => {
        const coins = await getTopCoins();
        expect(coins.length).toBeGreaterThan(150); // some will be filtered
        expect(coins.find(c => c.symbol === "USDT")).toBeUndefined();
        expect(coins[0]).toHaveProperty("exchangeSymbol");
    });

    it("all coins have required properties", async () => {
        const coins = await getTopCoins();
        for (const coin of coins) {
            expect(coin).toHaveProperty("symbol");
            expect(coin).toHaveProperty("id");
            expect(coin).toHaveProperty("name");
            expect(coin).toHaveProperty("exchangeSymbol");
            // Add more properties as needed
        }
    });

    it("does not include any known stablecoins", async () => {
        const coins = await getTopCoins();
        const stablecoins = FILTER_OUT_STABLES;
        for (const stable of stablecoins) {
            expect(coins.find(c => c.symbol === stable)).toBeUndefined();
        }
    });

    it("does not include any known staked coins", async () => {
        const coins = await getTopCoins();
        const stablecoins = FILTER_OUT_STAKES;
        for (const stable of stablecoins) {
            expect(coins.find(c => c.symbol === stable)).toBeUndefined();
        }
    });

    it("all symbols are unique", async () => {
        const coins = await getTopCoins();
        const symbols = coins.map(c => c.symbol);
        const uniqueSymbols = new Set(symbols);
        expect(uniqueSymbols.size).toBe(symbols.length);
    });
});

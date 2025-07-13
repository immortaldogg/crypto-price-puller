#!/usr/bin/env node

import { Command, CommandOptions } from 'commander';
import { getCoinMarketcapCoins } from './fetchCoins.js';
import { Coin } from './types/coinmarketcapTypes.js';

const program: Command = new Command();

program
  .name('fetch-prices')
  .description('A custom CLI tool to view and analyze crypto prices')
  .version('1.0.0');

// pull coin list from coinmarketcap
program
  .name('list')
  .description('Pull top coins from Coinmarketcap')
  .option('-t, --top <limit>', 'Number of coins', '100')
  .option('-s, --save', 'Save to local db')
  .action(async (options: CommandOptions) => {
    const coins: Coin[] = await getCoinMarketcapCoins();
    console.log(coins);
  });

program.parse(); 
const { Transaction, VersionedTransaction, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const RaydiumSwap = require('./RaydiumSwap');
const web3 = require("@solana/web3.js");

const swap = async() => {
    const executeSwap = true; // Change to true to execute swap
    const useVersionedTransaction = true; // Use versioned transaction
    const tokenAAmount = 0.01; // e.g. 0.01 SOL -> B_TOKEN

    const baseMint = 'So11111111111111111111111111111111111111112'; // e.g. SOLANA mint address
    const quoteMint = 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3'; // e.g. PYTH mint address process.env.WALLET_PRIVATE_KEY
    //consider using https://api.mainnet-beta.solana.com for swap on mainnet
    const raydiumSwap = new RaydiumSwap( process.env.RPC_URL, process.env.WALLET_PRIVATE_KEY);
    console.log(`Raydium swap initialized`);

    // Loading with pool keys from https://api.raydium.io/v2/sdk/liquidity/mainnet.json
    await raydiumSwap.loadPoolKeys();
    console.log(`Loaded pool keys`);

    // Trying to find pool info in the json we loaded earlier and by comparing baseMint and tokenBAddress
    let poolInfo = raydiumSwap.findPoolInfoForTokens(baseMint, quoteMint);

    if (!poolInfo) poolInfo = await raydiumSwap.findRaydiumPoolInfo(baseMint, quoteMint);

    if (!poolInfo) {
        throw new Error("Couldn't find the pool info");
    }

    console.log('Found pool info', poolInfo);

    const tx = await raydiumSwap.getSwapTransaction(
        quoteMint,
        tokenAAmount,
        poolInfo,
        0.0005 * LAMPORTS_PER_SOL, // Prioritization fee, now set to (0.0005 SOL)
        useVersionedTransaction,
        'in',
        5 // Slippage
    );

    if (executeSwap) {
        const txid = useVersionedTransaction ?
            await raydiumSwap.sendVersionedTransaction(tx) :
            await raydiumSwap.sendLegacyTransaction(tx);

        console.log(`https://solscan.io/tx/${txid}`);
    } else {
        const simRes = useVersionedTransaction ?
            await raydiumSwap.simulateVersionedTransaction(tx) :
            await raydiumSwap.simulateLegacyTransaction(tx);

        console.log(simRes);
    }
};

swap();

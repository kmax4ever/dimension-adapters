import { FetchResultFees, SimpleAdapter } from "../adapters/types";
import { CHAIN } from "../helpers/chains";
import * as sdk from "@defillama/sdk";
import { getBlock } from "../helpers/getBlock";
import { getPrices } from "../utils/prices";
import { Chain } from "@defillama/sdk/build/general";
import { ethers } from "ethers";


const address = '0x97de57eC338AB5d51557DA3434828C5DbFaDA371'
const topic0_fees_distibute = '0xec0804e8e1decb589af9c4ba8ebfbacd3be98929d4d53457dfd186061f489f04';
const event_fees_distibute = 'event FeeDistribution(address indexed feeAddress,uint256 feeAmount,uint256 timestamp)';
const contract_interface = new ethers.utils.Interface([
  event_fees_distibute
]);

const fetch = async (timestamp: number): Promise<FetchResultFees> => {
  const fromTimestamp = timestamp - 60 * 60 * 24
  const toTimestamp = timestamp
  try {
    const fromBlock = (await getBlock(fromTimestamp, CHAIN.ETHEREUM, {}));
    const toBlock = (await getBlock(toTimestamp, CHAIN.ETHEREUM, {}));
    const dailyFees = (await sdk.api.util.getLogs({
      target: address,
      fromBlock: fromBlock,
      toBlock: toBlock,
      topic: '',
      topics: [topic0_fees_distibute],
      keys: [],
      chain: CHAIN.ETHEREUM
    })).output.map((e: any) => contract_interface.parseLog(e))
    .map((e: any) => {
      return Number(e.args.feeAmount) / 10 ** 18;
    }).reduce((a: number, b: number) => a + b,0)
    const dailyRevenue = dailyFees;
    const dailyHoldersRevenue = dailyFees;
    return {
      dailyFees: `${dailyFees}`,
      dailyRevenue: `${dailyRevenue}`,
      dailyHoldersRevenue: `${dailyHoldersRevenue}`,
      timestamp
    }
  } catch(error) {
    console.error(error);
    throw error;
  }

}


const adapter: SimpleAdapter = {
  adapter: {
    [CHAIN.ETHEREUM]: {
      fetch: fetch,
      start: async () => 1682294400,
    },
  }
};

export default adapter;
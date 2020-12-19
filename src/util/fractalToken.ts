import BigNumber from 'bignumber.js';
import { tokenContract } from './contracts';
import { callMethod, bnDivdedByDecimals } from './utils';


// Getters
export const getTotalSupply  = async () => {
  if (!tokenContract) {
    return null;
  }
  const result = await callMethod(tokenContract.methods['totalSupply'], []);
  return bnDivdedByDecimals(new BigNumber(result));
}

export const getBalance = async (address: string) => {
  if (!tokenContract) {
    return null;
  }
  const result = await callMethod(tokenContract.methods['balanceOf'], [address]);
  return bnDivdedByDecimals(new BigNumber(result));
}

export const getLiquidityRemoveFee  = async () => {
  if (!tokenContract) {
    return null;
  }
  const result = await callMethod(tokenContract.methods['getLiquidityRemoveFee'], []);
  return result;
}

export const getFractalizeCallerFee  = async () => {
  if (!tokenContract) {
    return null;
  }
  const result = await callMethod(tokenContract.methods['getFractalizeCallerFee'], []);
  return result;
}

export const getMinTokenForFractalize  = async () => {
  if (!tokenContract) {
    return null;
  }
  const result = await callMethod(tokenContract.methods['getMinTokenForFractalize'], []);
  return bnDivdedByDecimals(new BigNumber(result));
}

export const getLastFractalize  = async () => {
  if (!tokenContract) {
    return null;
  }
  const result = await callMethod(tokenContract.methods['getLastFractalize'], []);
  return Number(result);
}

export const getFractalizeInterval  = async () => {
  if (!tokenContract) {
    return null;
  }
  const result = await callMethod(tokenContract.methods['getFractalizeInterval'], []);
  return Number(result);
}

export const getCurrentPoolAddress  = async () => {
  if (!tokenContract) {
    return null;
  }
  const result: string = await callMethod(tokenContract.methods['getCurrentPoolAddress'], []);
  return result;
}

export const getCurrentPairTokenAddress  = async () => {
  if (!tokenContract) {
    return null;
  }
  const result = await callMethod(tokenContract.methods['getCurrentPairTokenAddress'], []);
  return result;
}

export const getCurrentCycle  = async () => {
  if (!tokenContract) {
    return null;
  }
  const result = await callMethod(tokenContract.methods['getCurrentCycle'], []);
  return result;
}



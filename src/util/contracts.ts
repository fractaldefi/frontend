import { web3 } from './web3'
import abi from './FractalContract.json';
import { fractalContractAddress } from './config'

export const tokenAddress = fractalContractAddress;
export const tokenContract = web3 ? new web3.eth.Contract(abi as any, tokenAddress) : null;
export const tokenContractAbi = abi;

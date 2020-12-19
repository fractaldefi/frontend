import { connector } from './web3';

export const mobileSendTransaction = async (
    fromAddress: string,
    toAddress: string,
    encodedABI: any,
    gasLimit: string,
    successCallBack: Function,
    errorCallBack: Function,
    wei = `0x0`) => {
  if (connector.connected) {
    try {
      // gasPrice = '0x${gasPrice.toString(16)';
      const tx = {
        from: fromAddress,
        to: toAddress,
        gas: gasLimit,
        // chainId: 3,
        data: encodedABI,
        value: wei
      };
      // console.log("params: ==>", tx);

      // const txHash = await window.ethereum.request({
      //   method: 'eth_sendTransaction',
      //   params: [tx],
      // });
      // return txHash;

      connector.sendTransaction(tx)
        .then((result) => {
          // Returns transaction id (hash)
          successCallBack();
        })
        .catch((error) => {
          // Error returned when rejected
          errorCallBack();
        });

    } catch (err) {
      console.log('err :>> ', err);
      return null;
    }
  } else {
    return null;
  }
}

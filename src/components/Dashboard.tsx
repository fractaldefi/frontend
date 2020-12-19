import * as React from 'react';
import BigNumber from 'bignumber.js';
import { isMobile } from 'react-device-detect';
import Countdown from 'react-countdown';
import styled from 'styled-components';
import {
    getTotalSupply,
    getBalance,
    getLiquidityRemoveFee,
    getFractalizeCallerFee,
    getMinTokenForFractalize,
    getLastFractalize,
    getFractalizeInterval,
    getCurrentPoolAddress,
    getCurrentCycle,
} from '../util/fractalToken';
import { networkId } from '../util/config';
import moment from 'moment';
import { sendTransaction } from '../util/metamask';
import { mobileSendTransaction } from '../util/mobileWallet';
import { tokenContract, tokenAddress } from '../util/contracts';

BigNumber.config({
    DECIMAL_PLACES: 18,
    FORMAT: {
        prefix: '', // string to prepend
        decimalSeparator: '.', // decimal separator
        groupSeparator: ',', // grouping separator of the integer part
        groupSize: 3, // primary grouping size of the integer part
    }
});

const poolNames: any = {
    "0x90a257C6E5C0d01820516A690F02911b59EfF92c": "FRCTL-ETH",
}

const StyledDashboard = styled.div`
    display: flex;
    flex: 1;
    flex-direction: column;
    margin: 1rem auto 4rem auto;
    padding: 1.2rem 2.4rem;
    width: 520px;
    background-color: rgba(0,0,0,.33);
    text-align: justify;

    .fractalize-button {
        display: inline-block;
        border: none;
        padding: .8rem 1.4rem;
        margin: auto;
        text-decoration: none;
        color: #000;
        background-color: #ffffff;
        font-family: sans-serif;
        font-size: .8rem;
        cursor: pointer;
        text-align: center;
        -webkit-appearance: none;
        -moz-appearance: none;

        :hover, :focus {
            background: #000;
            color: #fff;
        }

        :disabled{
            background-color: #555;
            color: #f4f4f4;
            cursor: not-allowed;
            pointer-events: all !important;
        }
    }

    .dashboard-value {
        display: flex;
        flex-direction: row;
        margin-bottom: 1.2rem;
        .dashboard-value-title {
            margin-right: 1.2rem;
        }
        .dashboard-value-data {}
    }
`;

export default ({ address }: { address: string; }) => {
    const [progress, setProgress] = React.useState(false);    
    const [tokenBalance, setTokenBalance] = React.useState(new BigNumber(0));
    const [totalSupply, setTotalSupply] = React.useState(new BigNumber(0));
    const [totalBurn, setTotalBurn] = React.useState(new BigNumber(0));
    const [liquidityRemoveFee, setLiquidityRemoveFee] = React.useState(0);
    const [fractalizeCallerFee, setFractalizeCallerFee] = React.useState(0);
    const [minTokenForFractalize, setMinTokenForFractalize] = React.useState(new BigNumber(0));
    const [timeToFractalize, setTimeToFractalize] = React.useState(1);
    const [lastFractalizeTimestamp, setLastFractalizeTimetamp] = React.useState(0);
    const [currentTargetPoolName, setCurrentTargetPoolName] = React.useState("");
    const [currentCycle, setCurrentCycle] = React.useState(0);
    // const [apy, setAPY] = React.useState(0);
    // const [triPrice, setTriPrice] = React.useState(new BigNumber(0));
    // const [totalLiquidity, setTotalLiquidity] = React.useState(new BigNumber(0));

    const [timerID, setTimerID] = React.useState(0);
    let fractalizeInterval = 0;

    const fetchAllDataFromContract = React.useCallback(async (firstFlag = false) => {
        if (firstFlag) {
            setLiquidityRemoveFee(await getLiquidityRemoveFee());
            setFractalizeCallerFee(await getFractalizeCallerFee());
            const minToken = await getMinTokenForFractalize();
            if (minToken) {
                setMinTokenForFractalize(minToken);
            }
            const interval = await getFractalizeInterval();
            if (interval) {
                fractalizeInterval = interval;
            }
        }

        const totalSupply = await getTotalSupply();
        if (totalSupply) {
            setTotalSupply(totalSupply);
            setTotalBurn(new BigNumber(10000000).minus(totalSupply));
        }
        const bal = await getBalance(address);
        if (bal) {
            setTokenBalance(bal);
        }

        const lastFractalize = await getLastFractalize();
        if (lastFractalize) {
            const lastFractalizeTm = lastFractalize * 1000;
            const now = moment().unix();
            setLastFractalizeTimetamp(lastFractalizeTm);
            if (lastFractalize + fractalizeInterval > now) {
                setTimeToFractalize((lastFractalize + fractalizeInterval)*1000);
            } else {
                setTimeToFractalize(0);
            }
        }
        let currentTargetPool = await getCurrentPoolAddress();
        if (currentTargetPool) {
            setCurrentTargetPoolName(poolNames[currentTargetPool] || 'TBD');
        }

        const cycle = await getCurrentCycle();
        setCurrentCycle(cycle);
    }, [address]);

    React.useEffect(() => {
        if (address) {
            if (timerID > 0) {
                clearInterval(timerID);
            }
            let tempTimerID: number = setInterval(async () => {
                fetchAllDataFromContract();
            }, 30000) as any;
            setTimerID(tempTimerID);
            fetchAllDataFromContract(true);
        }
    }, [address])

    const renderer = (countdownProps: any) => {
        const { days, hours, minutes, seconds } = countdownProps
        return (
            <span style={{ width: '100%' }}>
                { seconds > 0 ? days * 1440 + hours * 60 + minutes + 1 : days * 1440 + hours * 60 + minutes} Minutes
            </span>
        )
    }

    const transactionDone = () => {
        setProgress(false);
        fetchAllDataFromContract(false);
    }

    const transactionError = (err: any) => {
        console.error(err);
        setProgress(false);
    }

    const onFractalize = async (_event: any) => {
        if (address == null || progress || timeToFractalize > 0) {
            return;
        }
        if (minTokenForFractalize.isGreaterThan(tokenBalance)) {
            window.alert(`The minimum amount for fractalize is ${minTokenForFractalize.toFormat(2)}.`);
            return;
        }
        setProgress(true);
        if (address && tokenContract) {
            const encodedABI = tokenContract.methods.fractalize().encodeABI();
            if (isMobile) {
                await mobileSendTransaction(address, tokenAddress, encodedABI, '0x927C0', transactionDone, transactionError);
            } else {
                await sendTransaction(address, tokenAddress, encodedABI, '0x927C0', transactionDone, transactionError);
            }
        }
    }

    if (!address) {
        return (
            <div>
                <span>Unable to connect {networkId === '1' ? 'Main' : 'Test'} Ethereum Network.</span><br />
                <span>Please change your MetaMask network.</span>
            </div>
        )
    }

    const renderValueWithData = (title: string, value: string | JSX.Element) => (
        <div className="dashboard-value">
            <div className="dashboard-value-title">
                {title}
            </div>
            <div className="dashboard-value-data">
                {value}
            </div>
        </div>
    )

    return (
        <StyledDashboard>
            <div>
                {renderValueWithData('Your Balance:', `${tokenBalance.toFormat(4)} FRCTL`)}
                {renderValueWithData('FRCTL Supply:', `${totalSupply.toFormat(4)} FRCTL`)}
                {renderValueWithData('FRCTL Burned:', `${totalBurn.toFormat(4)} FRCTL`)}
                {renderValueWithData('Target Pool:', `${currentTargetPoolName}`)}
                {renderValueWithData('Current Cycle:', `${currentCycle}`)}
                {renderValueWithData('Last Fractalize:', `${lastFractalizeTimestamp ? moment(new Date(lastFractalizeTimestamp)).format("dddd, MMMM Do YYYY, h:mm:ss a") : ''}`)}
                {renderValueWithData('Fractalize available in:', timeToFractalize > 0 ? <Countdown date={timeToFractalize} renderer={renderer} /> : '0 Minutes')}
            </div>
            <div>
                <button className="fractalize-button" onClick={onFractalize} disabled={timeToFractalize > 1}>
                    FRACTALIZE
                </button>
            </div>
            <div>
                <p>When the Fractalize function is called...</p>
                <span>- {liquidityRemoveFee}% of the FRCTL-ETH liquidity is removed</span><br />
                <span>- The ETH is used to market buy FRCTL</span><br />
                <span>- {100 - fractalizeCallerFee}% of the FRCTL is burned</span><br />
                <span>- {fractalizeCallerFee}% is sent to the caller as rewards for spending gas</span><br /><br />
                <p>This function can be called once per hour by anyone holding at least {minTokenForFractalize.toFormat(0)} FRCTL</p>
            </div>
        </StyledDashboard>
    );
};

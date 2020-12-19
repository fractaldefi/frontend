import * as React from 'react';
import BigNumber from 'bignumber.js';
// import Countdown from 'react-countdown';
// import moment from 'moment';
import { StyledDashboard } from './StyledDashboard'
import {
    getTotalSupply,
    getBalance,
    // getLiquidityRemoveFee,
    // getFractalizeCallerFee,
    // getMinTokenForFractalize,
    // getLastFractalize,
    getFractalizeInterval,
    getCurrentPoolAddress,
    getCurrentCycle,
    getTaxFee,
    getCurrentTotalTax,
    getDevFee,
    getBurnFee,
    getLockFee,
    getCycleLimit,
} from '../util/fractalToken';
import { networkId } from '../util/config';

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

export default ({ address }: { address: string; }) => {
    const [tokenBalance, setTokenBalance] = React.useState(new BigNumber(0));
    const [totalSupply, setTotalSupply] = React.useState(new BigNumber(0));
    const [totalBurn, setTotalBurn] = React.useState(new BigNumber(0));
    // const [liquidityRemoveFee, setLiquidityRemoveFee] = React.useState(0);
    // const [fractalizeCallerFee, setFractalizeCallerFee] = React.useState(0);
    // const [minTokenForFractalize, setMinTokenForFractalize] = React.useState(new BigNumber(0));
    const [timeToFractalize, setTimeToFractalize] = React.useState(1);
    // const [lastFractalizeTimestamp, setLastFractalizeTimetamp] = React.useState(0);
    const [currentTargetPoolName, setCurrentTargetPoolName] = React.useState("");
    const [currentCycle, setCurrentCycle] = React.useState(0);
    const [currentTaxFee, setCurrentTaxFee] = React.useState(0);
    const [currentTotalTax, setCurrentTotalTax] = React.useState(0.0);
    const [currentDevFee, setCurrentDevFee] = React.useState(0.0);
    const [currentBurnFee, setCurrentBurnFee] = React.useState(0.0);
    const [currentLockFee, setCurrentLockFee] = React.useState(0.0);
    const [currentCycleLimit, setCurrentCycleLimit] = React.useState(0);

    const [timerID, setTimerID] = React.useState(0);
    let fractalizeInterval = 0;

    const fetchAllDataFromContract = React.useCallback(async (firstFlag = false) => {
        if (firstFlag) {
            // setLiquidityRemoveFee(await getLiquidityRemoveFee());
            // setFractalizeCallerFee(await getFractalizeCallerFee());
            // const minToken = await getMinTokenForFractalize();
            // if (minToken) {
            //     setMinTokenForFractalize(minToken);
            // }
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

        // const lastFractalize = await getLastFractalize();
        // if (lastFractalize) {
        //     const lastFractalizeTm = lastFractalize * 1000;
        //     const now = moment().unix();
        //     setLastFractalizeTimetamp(lastFractalizeTm);
        //     if (lastFractalize + fractalizeInterval > now) {
        //         setTimeToFractalize((lastFractalize + fractalizeInterval)*1000);
        //     } else {
        //         setTimeToFractalize(0);
        //     }
        // }
        let currentTargetPool = await getCurrentPoolAddress();
        if (currentTargetPool) {
            setCurrentTargetPoolName(poolNames[currentTargetPool] || 'TBD');
        }
        const cycle = await getCurrentCycle();
        setCurrentCycle(cycle);

        const taxFee = await getTaxFee();
        setCurrentTaxFee(parseFloat(taxFee));

        const totalTax = await getCurrentTotalTax();
        setCurrentTotalTax(parseFloat(totalTax));

        const devFee = await getDevFee();
        setCurrentDevFee(parseFloat(devFee));

        const burnFee = await getBurnFee()
        setCurrentBurnFee(parseFloat(burnFee));

        const lockFee = await getLockFee();
        setCurrentLockFee(parseFloat(lockFee));

        const cycleLimit = await getCycleLimit();
        setCurrentCycleLimit(parseFloat(cycleLimit));

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

    // const renderer = (countdownProps: any) => {
    //     const { days, hours, minutes, seconds } = countdownProps
    //     return (
    //         <span style={{ width: '100%' }}>
    //             { seconds > 0 ? days * 1440 + hours * 60 + minutes + 1 : days * 1440 + hours * 60 + minutes} Minutes
    //         </span>
    //     )
    // }

    if (!address) {
        return (
            <StyledDashboard>
                <div style={{ textAlign: 'center' }}>
                    <span>Unable to connect {networkId === '1' ? 'Main' : 'Test'} Ethereum Network.</span><br />
                    <span>Please change your MetaMask network.</span>
                </div>
            </StyledDashboard>
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
                {renderValueWithData('Current Cycle:', `${currentCycle} out of ${currentCycleLimit + 1}`)}
                {/* {renderValueWithData('Last Fractalize:', `${lastFractalizeTimestamp ? moment(new Date(lastFractalizeTimestamp)).format("dddd, MMMM Do YYYY, h:mm:ss a") : ''}`)} */}
                {/* {renderValueWithData('Fractalize available in:', timeToFractalize > 0 ? <Countdown date={timeToFractalize} renderer={renderer} /> : '0 Minutes')} */}
                <hr />
                {renderValueWithData('Tax Fee:', `${(currentTaxFee * 0.1)}%`)}
                {renderValueWithData('Dev Fee:', `${(currentDevFee * 0.1)}%`)}
                {renderValueWithData('Burn (incl. lock fee):', `${((currentBurnFee + currentLockFee) * 0.1)}%`)}
                <hr />
                {renderValueWithData('TOTAL Current Tax:', `${(currentTotalTax * 0.1)}%`)}
            </div>
            <div style={{ textAlign: 'center' }}>
                <a className="fractalize-button" href="https://telegram.me/collablandbot?start=rec57DdDrMS3Qlxex_-tpc" target="_blank">
                    FEE VOTE TG
                </a>
            </div>
            <div style={{ textAlign: 'center' }}>
                <a className="fractalize-button" href="https://www.dextools.io/app/uniswap/pair-explorer/0x90a257c6e5c0d01820516a690f02911b59eff92c" target="_blank">
                    DEX TOOLS
                </a>
            </div>
        </StyledDashboard>
    );
};


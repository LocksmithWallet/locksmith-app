import {
  Skeleton,
  Text
} from '@chakra-ui/react'
import { 
  useCoinCapPrice,
  USDFormatter,
} from '../hooks/Prices';
import {
  useContextBalanceSheet
} from '../hooks/contracts/Ledger';
import {
  Networks 
} from '../configuration/Networks';
import { ethers } from 'ethers';
import { useNetwork } from 'wagmi';

export function ContextBalanceUSD({contextId, identifier, skeletonProps, textProps, ...rest}) {
  const trustBalanceSheet = useContextBalanceSheet(contextId, identifier);

  // get the trust context arn registry for the given trust ID
  const arns = trustBalanceSheet.isSuccess ? trustBalanceSheet.data[0] : [];
  const arnBalances = trustBalanceSheet.isSuccess ? trustBalanceSheet.data[1] : [];

  return !trustBalanceSheet.isSuccess ? <Skeleton {... textProps} {...skeletonProps}/> :
    (arns.length !== 0 ? <RecursiveTrustBalanceUSD arns={arns} arnBalances={arnBalances} 
          position={0} total={0} textProps={textProps}/> : <Text {...textProps}>$0.00</Text>)
}

const RecursiveTrustBalanceUSD = ({arns, arnBalances, position, total, textProps, ...rest}) => {
  const asset = Networks.getAsset(useNetwork().chain.id, arns[position]);

  // grab the coin cap price for the position we are at.
  const assetPrice = useCoinCapPrice(asset.coinCapId);

  // once we have the asset price, determine the total arn value
  const arnValue = !assetPrice.isSuccess ? 0 : assetPrice.data * 
    ethers.utils.formatUnits(arnBalances[position], asset.decimals);

  // this becomes an interesting trick where we 'trickle down' loaded asset
  // prices recursively until we reach the end node where we simply display
  // the value. This is a way to "add to the balance" every time 
  // #useCoinCapPrice comes back, and allows us to parallelize all promises.
  return position === (arnBalances.length - 1) ?
    <Text {...textProps}>{USDFormatter.format(total + arnValue)}</Text> :
    <RecursiveTrustBalanceUSD arns={arns} arnBalances={arnBalances}
      position={position+1} total={total + arnValue} textProps={textProps}/>
}

import { ethers } from 'ethers';

export function getAssetResourceName(contractAddress, tokenStandard, assetId) {
  return ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(
      ['address','uint256','uint256'],
      [contractAddress, tokenStandard, assetId]
    )
  );
};

export const GAS_ARN = getAssetResourceName(ethers.constants.AddressZero, 0, 0);

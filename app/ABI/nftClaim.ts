export const nftClaimAbi = [
  { "type":"function","stateMutability":"payable","name":"claim","inputs":[{"name":"editionId","type":"uint256"}],"outputs":[] },
  { "type":"function","stateMutability":"view","name":"priceWei","inputs":[],"outputs":[{"type":"uint256"}] },
  { "type":"function","stateMutability":"view","name":"EDITION_COUNT","inputs":[],"outputs":[{"type":"uint256"}] },
] as const;

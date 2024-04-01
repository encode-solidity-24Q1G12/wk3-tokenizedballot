# encode-tokenBallot-script
Homework 3 of the solidity bootcamp, create voting script to show tokenized ballot
## 1. create accounts for voting
```typescript
const [deployer, acc1, acc2, acc3, acc4] = await viem.getWalletClients();
```
Account1 address: 0x70997970c51812dc3a010c7d01b50e0d17dc79c8  
Account2 address: 0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc  
Account3 address: 0x90f79bf6eb2c4f870365e785982e1f101e93b906  
Account4 address: 0x15d34aaf54267db7d7c367839aaf71a00a2c6a65  
## 2. deploy Token contract
```typescript
const contract = await viem.deployContract("MyToken");
```
Token contract deployed at 0x5fbdb2315678afecb367f032d93f642f64180aa3  
## 3. mint tokens
```typesript
const mintTxAcc1 = await contract.write.mint([acc1.account.address, MINT_VALUE,]);
const mintTxAcc2 = await contract.write.mint([acc2.account.address, MINT_VALUE,]);
const mintTxAcc3 = await contract.write.mint([acc3.account.address, MINT_VALUE,]);
```
Minted 100000000000000000000 decimal units to account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8
Minted 100000000000000000000 decimal units to account 0x90f79bf6eb2c4f870365e785982e1f101e93b906
Minted 100000000000000000000 decimal units to account 0x90f79bf6eb2c4f870365e785982e1f101e93b906
### 3.1. Before deploying vote contract
When minting before deploying the vote contract, the block number will be lower and the voting power will be available.  
### 3.2. After deploying vote contract
In this case the block number of the vote contract will be earlier than the available voting power and voting will result in an error.  
```
details: "VM Exception while processing transaction: reverted with reason string 'Not enough votingpower'",
```
## 4. delegate voting power
```typescript
const delTxAcc1 = await contract.write.delegate([acc1.account.address], {account: acc1.account,});
const delTxAcc2 = await contract.write.delegate([acc2.account.address], {account: acc2.account,});
const delTxAcc3 = await contract.write.delegate([acc3.account.address], {account: acc3.account,});
```
Account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 has 100000000000000000000 units of voting power after self delegating  
Account 0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc has 100000000000000000000 units of voting power after self delegating  
Account 0x90f79bf6eb2c4f870365e785982e1f101e93b906 has 100000000000000000000 units of voting power after self delegating  
## 5. deploy vote contract
```typescript
const tokenBallot = await viem.deployContract("TokenizedBallot",[PROPOSALS.map((prop) => toHex(prop, { size: 32 })),contract.address, lastBlockNumber])
```
Ballot contract deployed at 0xdc64a140aa3e981100a9beca4e685f962f0cf6c9  
## 6. voting
### Accounts 1,2,3
```typescript
await acc1.writeContract({abi: abi,functionName: "vote",args: [2n, 1n],address: tokenBallotAddress,});
await acc2.writeContract({abi: abi,functionName: "vote",args: [2n, 1n],address: tokenBallotAddress,});
await acc3.writeContract({abi: abi,functionName: "vote",args: [1n, 1n],address: tokenBallotAddress,});
```
Account 1 voted Strawberry
Account 2 voted Strawberry
Account 3 voted Vanilla
### Account 4
```typescript
await acc4.writeContract({
    abi: abi,
    functionName: "vote",
    args: [2n, 1n],
    address: tokenBallotAddress,
  });
```
failed
```
details: "VM Exception while processing transaction: reverted with reason string 'Not enough votingpower'",
  docsPath: undefined,
  metaMessages: [
    'Request Arguments:',
    '  from:  0x15d34aaf54267db7d7c367839aaf71a00a2c6a65\n' +
      '  to:    0xdc64a140aa3e981100a9beca4e685f962f0cf6c9\n' +
      '  data:  0xb384abef00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001'
  ],
  shortMessage: 'An unknown RPC error occurred.',
  version: 'viem@2.8.12',
```
## 7. result
```typescript
const winner = await publicClient.readContract({
      address: tokenBallotAddress,
      abi,
      functionName: "winnerName",
      args: [],
    }) as `0x${string}`;
```
Proposal Strawberry is the winner.

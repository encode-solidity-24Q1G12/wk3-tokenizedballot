import { viem } from "hardhat"
import { parseEther, formatEther, toHex, hexToString } from "viem";
import { abi } from "../artifacts/contracts/TokenizedBallot.sol/TokenizedBallot.json"

const MINT_VALUE=parseEther("100");
const PROPOSALS = ["Chocolate", "Vanilla", "Strawberry", "Blueberry", "Passionfruit", "Mint", "Raspberry"];


async function main() {
    // get a client for interacting with the network
    const publicClient = await viem.getPublicClient();
    // get some wallets
    const [deployer, acc1, acc2, acc3, acc4] = await viem.getWalletClients();
    console.log(`Account1 address: ${acc1.account.address}`);
    console.log(`Account2 address: ${acc2.account.address}`);
    console.log(`Account3 address: ${acc3.account.address}`);
    console.log(`Account4 address: ${acc4.account.address}`);
    // deploy the token contract
    const contract = await viem.deployContract("MyToken");
    console.log(`Token contract deployed at ${contract.address}\n`);
    // check the balance before minting
    const balanceZERO = await contract.read.balanceOf([acc1.account.address]);
    console.log(
      `Account ${
        acc1.account.address
      } has ${balanceZERO.toString()} decimal units of MyToken\n`
    );
/*
    // Try to vote with zero balance
    const delegate1tx = await contract.write.delegate([acc1.account.address]);
    //const vote1tx = await tokenBallot.write.vote([1n,1n]);
    const hash = await acc1.writeContract({
        abi: abi,
        functionName: "vote",
        args: [1n, 1n],
        address: tokenBallotAddress,
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    console.log(receipt.status);
*/

    // begin minting MINT_VALUE tokens for acc1, acc2, acc3
    const mintTxAcc1 = await contract.write.mint([acc1.account.address, MINT_VALUE,]);
    // make sure the transaction goes through
    await publicClient.waitForTransactionReceipt({ hash: mintTxAcc1 });
    console.log(
      `Minted ${MINT_VALUE.toString()} decimal units to account ${
        acc1.account.address
      }\n`
    );
    const mintTxAcc2 = await contract.write.mint([acc2.account.address, MINT_VALUE,]);
    // make sure the transaction goes through
    await publicClient.waitForTransactionReceipt({ hash: mintTxAcc2 });
    console.log(
      `Minted ${MINT_VALUE.toString()} decimal units to account ${
        acc3.account.address
      }\n`
    );
    const mintTxAcc3 = await contract.write.mint([acc3.account.address, MINT_VALUE,]);
    // make sure the transaction goes through
    await publicClient.waitForTransactionReceipt({ hash: mintTxAcc3 });
    console.log(
      `Minted ${MINT_VALUE.toString()} decimal units to account ${
        acc3.account.address
      }\n`
    );
    // END minting
    // BEGIN delegating
    const delTxAcc1 = await contract.write.delegate([acc1.account.address], {
      account: acc1.account,
    });
    await publicClient.waitForTransactionReceipt({ hash: delTxAcc1 });
    const votesAfterAcc1 = await contract.read.getVotes([acc1.account.address]);
    console.log(
      `Account ${
        acc1.account.address
      } has ${votesAfterAcc1.toString()} units of voting power after self delegating\n`
    );

    const delTxAcc2 = await contract.write.delegate([acc2.account.address], {
      account: acc2.account,
    });
    await publicClient.waitForTransactionReceipt({ hash: delTxAcc2 });
    const votesAfterAcc2 = await contract.read.getVotes([acc2.account.address]);
    console.log(
      `Account ${
        acc2.account.address
      } has ${votesAfterAcc2.toString()} units of voting power after self delegating\n`
    );

    const delTxAcc3 = await contract.write.delegate([acc3.account.address], {
      account: acc3.account,
    });
    await publicClient.waitForTransactionReceipt({ hash: delTxAcc3 });
    const votesAfterAcc3 = await contract.read.getVotes([acc3.account.address]);
    console.log(
      `Account ${
        acc3.account.address
      } has ${votesAfterAcc3.toString()} units of voting power after self delegating\n`
    );
    // END delegating

    // BEGIN deploy contract
      const lastBlockNumber = await publicClient.getBlockNumber();
      const tokenBallot = await viem.deployContract("TokenizedBallot",[PROPOSALS.map((prop) => toHex(prop, { size: 32 })),contract.address, lastBlockNumber])
      const tokenBallotAddress = tokenBallot.address;
      console.log(`Ballot contract deployed at ${tokenBallot.address}\n`);
    // END deploying

    // BEGIN voting
    // try to vote after having funds and delegation
    
    await acc1.writeContract({
      abi: abi,
      functionName: "vote",
      args: [2n, 1n],
      address: tokenBallotAddress,
  });
  console.log(`Account 1 voted ${PROPOSALS[2]}`);

  await acc2.writeContract({
    abi: abi,
    functionName: "vote",
    args: [2n, 1n],
    address: tokenBallotAddress,
  });
  console.log(`Account 2 voted ${PROPOSALS[2]}`);

  await acc3.writeContract({
    abi: abi,
    functionName: "vote",
    args: [1n, 1n],
    address: tokenBallotAddress,
  });
  console.log(`Account 3 voted ${PROPOSALS[1]}`);
  /*
  console.log("Expect error, Account 4 has no voting power and funds");
  await acc4.writeContract({
    abi: abi,
    functionName: "vote",
    args: [2n, 1n],
    address: tokenBallotAddress,
  });
  console.log(`Account 4 voted ${PROPOSALS[2]}`);
  */

  // END voting

  // BEGIN result
  const result = await publicClient.readContract({
      address: tokenBallotAddress,
      abi,
      functionName: "proposals",
      args: [2],
    }) as any[];
    console.log(`Proposal ${hexToString(result[0], { size: 32 })} has ${result[1]} votes so far.`);

    const winner = await publicClient.readContract({
      address: tokenBallotAddress,
      abi,
      functionName: "winnerName",
      args: [],
    }) as `0x${string}`;
    console.log(`Proposal ${hexToString(winner, { size: 32 })} is the winner.`);

    // END result


    console.log(`Last block ${await publicClient.getBlockNumber()}`);

}

main().catch((err) => {
    console.log(err);
    process.exitCode = 1;
});
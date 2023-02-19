import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import "hardhat-deploy";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { execute, get, getOrNull, log } = deployments;
  const { deployer } = await getNamedAccounts();

  const Fed = await getOrNull("Fed");
  if (Fed) {
    log(`reusing "Fed" at ${Fed.address}`);
  } else {
    //Set USDC price feed (Chainlink)
    await execute(
      "Oracle",
      { from: deployer, log: true },
      "setFeed",
      (
        await get("musdc")
      ).address,
      "0x50834f3163758fcc1df9973b6e91f0f0f0434ad3", //TODO: Chainlink Oracle Address on arbitrum for usdc/usd
      "6" // usdc decimals
    );
    //Set fixed 1USD price feed for CORE
    await execute(
      "Oracle",
      { from: deployer, log: true },
      "setFixedPrice",
      (
        await get("musd")
      ).address,
      "1000000000000000000" // Price
    );
    await execute(
      "Oracle",
      { from: deployer, log: true },
      "setFeed",
      (
        await get("mEther")
      ).address,
      "0x639fe6ab55c921f74e7fac1ee960c0b6293ba612", // TODO: Chainlink Oracle on arbitrum for ETH/USD
      "18" // Decimals
    );
  }
};

export default func;
func.tags = ["PriceFeeds"];

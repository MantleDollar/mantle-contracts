import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import "hardhat-deploy";
import { ethers } from "hardhat";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { execute, get, getOrNull, log } = deployments;
  const { deployer } = await getNamedAccounts();

  const Fed = await getOrNull("Fed");
  if (Fed) {
    log(`reusing "Fed" at ${Fed.address}`);
  } else {
    //Set the oracle for price queries
    await execute(
      "Comptroller",
      { from: deployer, log: true },
      "_setPriceOracle",
      (
        await get("Oracle")
      ).address
    );
    //Set the close Factor
    await execute(
      "Comptroller",
      { from: deployer, log: true },
      "_setCloseFactor",
      ethers.utils.parseEther("0.5")
    );
    //Set Liquidation Incentive
    await execute(
      "Comptroller",
      { from: deployer, log: true },
      "_setLiquidationIncentive",
      ethers.utils.parseEther("5")
    );
    //Create CORE Market
    await execute(
      "Comptroller",
      { from: deployer, log: true },
      "_supportMarket",
      (
        await get("musd")
      ).address
    );
    //Create ETH Market
    await execute(
      "Comptroller",
      { from: deployer, log: true },
      "_supportMarket",
      (
        await get("mEther")
      ).address
    );
    //Create USDC Market
    await execute(
      "Comptroller",
      { from: deployer, log: true },
      "_supportMarket",
      (
        await get("musdc")
      ).address
    );
    //Set the CollateralFactor for CORE
    await execute(
      "Comptroller",
      { from: deployer, log: true },
      "_setCollateralFactor",
      (
        await get("musd")
      ).address,
      ethers.utils.parseEther("0.25")
    );
    //Set the CollateralFactor for Eth
    await execute(
      "Comptroller",
      { from: deployer, log: true },
      "_setCollateralFactor",
      (
        await get("mEther")
      ).address,
      ethers.utils.parseEther("0.75")
    );
    //Set the CollateralFactor for USDC
    await execute(
      "Comptroller",
      { from: deployer, log: true },
      "_setCollateralFactor",
      (
        await get("musdc")
      ).address,
      ethers.utils.parseEther("0.85")
    );
    //Set the IMFFactor for CORE
    await execute(
      "Comptroller",
      { from: deployer, log: true },
      "_setIMFFactor",
      (
        await get("musd")
      ).address,
      ethers.utils.parseEther("0.04")
    );
    //Set the IMFFactor for ETH
    await execute(
      "Comptroller",
      { from: deployer, log: true },
      "_setIMFFactor",
      (
        await get("mEther")
      ).address,
      ethers.utils.parseEther("0.04")
    );
    //Set the IMFFactor for USDC
    await execute(
      "Comptroller",
      { from: deployer, log: true },
      "_setIMFFactor",
      (
        await get("musdc")
      ).address,
      ethers.utils.parseEther("0.04")
    );
    //Set the Maximum amount of borrowed CORE tokens (10mil)
    await execute(
      "Comptroller",
      { from: deployer, log: true },
      "_setMarketBorrowCaps",
      [(await get("musd")).address],
      [ethers.utils.parseEther("10000000")]
    );
    console.log("Comptroller Configured");

    //Set the ReserveFactor for CORE
    await execute(
      "musd",
      { from: deployer, log: true },
      "_setReserveFactor",
      ethers.utils.parseEther("0.5")
    );
    //Set the ReserveFactor for ETH
    await execute(
      "mEther",
      { from: deployer, log: true },
      "_setReserveFactor",
      ethers.utils.parseEther("0.5")
    );
    //Set the ReserveFactor for USDC
    await execute(
      "musdc",
      { from: deployer, log: true },
      "_setReserveFactor",
      ethers.utils.parseEther("0.5")
    );
    console.log("mTokens configured");

    //Allow Fed to mint the CORE
    await execute(
      "COREContract",
      { from: deployer, log: true },
      "addMinter",
      (
        await get("fed")
      ).address
    );
    console.log("Fed Minters set");

    //fed expension (minting 10mil CORE tokens and depositing them into the protocol)
    await execute(
      "fed",
      { from: deployer, log: true },
      "expansion",
      ethers.utils.parseEther("10000000")
    );
    console.log("Fed Expanded");

    //In order for the subgraph to work we accrue interest once for every mToken
    await execute("musd", { from: deployer, log: true }, "accrueInterest");
    await execute("musdc", { from: deployer, log: true }, "accrueInterest");
    await execute("mEther", { from: deployer, log: true }, "accrueInterest");

    console.log("Interests accrued");
  }
};

export default func;
func.tags = ["PriceFeeds"];

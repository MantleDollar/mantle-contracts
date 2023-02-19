import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import "hardhat-deploy";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, get, getOrNull, log } = deployments;
  const { deployer } = await getNamedAccounts();

  const mUSDFactory = await getOrNull("mUSDFactory");
  if (mUSDFactory) {
    log(`reusing "mUSDFactory" at ${mUSDFactory.address}`);
  } else {
    await deploy("mUSD", {
      from: deployer,
      log: true,
      skipIfAlreadyDeployed: true,
      contract: "CErc20Delegator",
      args: [
        (await get("COREContract")).address,
        (await get("Unitroller")).address,
        (await get("JumpRateModelContract")).address,
        "200000000000000000",
        "mantle deposited CORE",
        "mUSD",
        "8",
        (await get("CErc20Delegate")).address,
        0, //Unused data entry
      ],
    });

    await deploy("mUSDC", {
      from: deployer,
      log: true,
      skipIfAlreadyDeployed: true,
      contract: "CErc20Delegator",
      args: [
        (await get("USDC")).address,
        (await get("Unitroller")).address,
        (await get("USDCJumpRateModelContract")).address,
        "200000000000000000",
        "mantle deposited CORE",
        "mUSD",
        "8",
        (await get("CErc20Delegate")).address,
        0, //Unused data entry
      ],
    });
  }
};

export default func;
func.tags = ["MUSD"];

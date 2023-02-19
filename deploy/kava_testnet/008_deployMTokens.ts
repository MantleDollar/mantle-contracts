import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import "hardhat-deploy";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, get, getOrNull, log } = deployments;
  const { deployer } = await getNamedAccounts();

  const mEther = await getOrNull("mEther");
  if (mEther) {
    log(`reusing "mEther" at ${mEther.address}`);
  } else {
    await deploy("mEther", {
      from: deployer,
      log: true,
      skipIfAlreadyDeployed: true,
      contract: "CEther",
      args: [
        (await get("Unitroller")).address,
        (await get("WhitePaperInterestRateModel")).address,
        "200000000000000000",
        "mantle deposited ETH",
        "mETH",
        "8",
      ],
    });
  }
};

export default func;
func.tags = ["MTokens"];

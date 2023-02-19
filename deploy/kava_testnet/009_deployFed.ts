import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import "hardhat-deploy";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, get, getOrNull, log } = deployments;
  const { deployer } = await getNamedAccounts();

  const Fed = await getOrNull("Fed");
  if (Fed) {
    log(`reusing "Fed" at ${Fed.address}`);
  } else {
    await deploy("Fed", {
      from: deployer,
      log: true,
      skipIfAlreadyDeployed: true,
      contract: "Fed",
      args: [(await get("mUSDC")).address],
    });
  }
};

export default func;
func.tags = ["Fed"];

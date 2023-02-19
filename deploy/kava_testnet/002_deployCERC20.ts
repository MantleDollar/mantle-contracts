import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import "hardhat-deploy";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, execute, getOrNull, log } = deployments;
  const { deployer } = await getNamedAccounts();

  const CErc20Delegate = await getOrNull("CErc20Delegate");
  if (CErc20Delegate) {
    log(`reusing "CErc20Delegate" at ${CErc20Delegate.address}`);
  } else {
    await deploy("CErc20Delegate", {
      from: deployer,
      log: true,
      skipIfAlreadyDeployed: true,
    });
  }
};

export default func;
func.tags = ["CErc20Delegate"];

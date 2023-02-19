import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import "hardhat-deploy";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, execute, getOrNull, log } = deployments;
  const { deployer } = await getNamedAccounts();

  const Comptroller = await getOrNull("Comptroller");
  if (Comptroller) {
    log(`reusing "Comptroller" at ${Comptroller.address}`);
  } else {
    await deploy("Comptroller", {
      from: deployer,
      log: true,
      skipIfAlreadyDeployed: true,
    });
  }
};

export default func;
func.tags = ["Comptroller"];

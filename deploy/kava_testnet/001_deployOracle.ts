import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import "hardhat-deploy";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, execute, getOrNull, log } = deployments;
  const { deployer } = await getNamedAccounts();

  const Oracle = await getOrNull("Oracle");
  if (Oracle) {
    log(`reusing "Oracle" at ${Oracle.address}`);
  } else {
    await deploy("Oracle", {
      from: deployer,
      log: true,
      skipIfAlreadyDeployed: true,
    });
  }
};

export default func;
func.tags = ["Oracle"];

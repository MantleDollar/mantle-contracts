import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import "hardhat-deploy";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, execute, getOrNull, log } = deployments;
  const { deployer } = await getNamedAccounts();

  const COREContract = await getOrNull("COREContract");
  if (COREContract) {
    log(`reusing "ERC20" at ${COREContract.address}`);
  } else {
    await deploy("COREContract", {
      from: deployer,
      log: true,
      skipIfAlreadyDeployed: true,
      contract: "ERC20",
      args: ["CORE USD", "CORE", "18"],
    });
  }
};

export default func;
func.tags = ["ERC20"];

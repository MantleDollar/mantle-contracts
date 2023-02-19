import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import "hardhat-deploy";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, execute, get, getOrNull, log } = deployments;
  const { deployer } = await getNamedAccounts();

  const Unitroller = await getOrNull("Unitroller");
  if (Unitroller) {
    log(`reusing "Unitroller" at ${Unitroller.address}`);
  } else {
    await deploy("contracts/Comptroller/Unitroller.sol:Unitroller", {
      from: deployer,
      log: true,
      skipIfAlreadyDeployed: true,
    });

    await execute(
      "Unitroller",
      { from: deployer, log: true },
      "_setPendingImplementation",
      (
        await get("Comptroller")
      ).address
    );

    await execute(
      "Comptroller",
      { from: deployer, log: true },
      "_become",
      (
        await get("Unitroller")
      ).address
    );
  }
};

export default func;
func.tags = ["Unitroller"];

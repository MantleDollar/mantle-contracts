import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import "hardhat-deploy";
import { ethers } from "hardhat";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, get, getOrNull, log } = deployments;
  const { deployer } = await getNamedAccounts();

  const Fed = await getOrNull("Fed");
  if (Fed) {
    log(`reusing "Fed" at ${Fed.address}`);
  } else {
    await deploy("Stabilizer", {
      from: deployer,
      log: true,
      skipIfAlreadyDeployed: true,
      contract: "Stabilizer",
      args: [
        (
          await get("COREContract")
        ).address, // CORE address
        (
          await get("DAI")
        ).address, // DAI (Arbitrum) TODO: Can we change this to a bridged version of USDC?
        100, // 1% buy fee
        100, // 1% sell fee
        ethers.utils.parseEther("15000000"), // 15 mil supply],
      ],
    });
  }
};

export default func;
func.tags = ["Stabilizer"];

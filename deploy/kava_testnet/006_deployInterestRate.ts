import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import "hardhat-deploy";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, execute, get, getOrNull, log } = deployments;
  const { deployer } = await getNamedAccounts();

  const JumpRateModelV2 = await getOrNull("JumpRateModelV2");
  if (JumpRateModelV2) {
    log(`reusing "JumpRateModelV2" at ${JumpRateModelV2.address}`);
  } else {
    await deploy("JumpRateModelContract", {
      from: deployer,
      log: true,
      skipIfAlreadyDeployed: true,
      contract: "JumpRateModelV2",
      args: [
        "0", //uint baseRatePerYear
        "49999999998268800", //uint multiplierPerYear
        "1089999999998841600", //uint jumpMultiplierPerYear
        "800000000000000000", //uint kink_
      ],
    });

    await deploy("USDCJumpRateModelContract", {
      from: deployer,
      log: true,
      skipIfAlreadyDeployed: true,
      contract: "JumpRateModelV2",
      args: [
        "0", //uint baseRatePerYear
        "49999999998268800", //uint multiplierPerYear
        "1089999999998841600", //uint jumpMultiplierPerYear
        "800000000000000000", //uint kink_
      ],
    });
  }

  const WhitePaperInterestRateModel = await getOrNull(
    "WhitePaperInterestRateModel"
  );
  if (WhitePaperInterestRateModel) {
    log(
      `reusing "WhitePaperInterestRateModel" at ${WhitePaperInterestRateModel.address}`
    );
  } else {
    await deploy("WhitePaperInterestRateModel", {
      from: deployer,
      log: true,
      skipIfAlreadyDeployed: true,
      contract: "JumpRateModelV2",
      args: ["19999999999728000", "99999999998640000"],
    });
  }
};

export default func;
func.tags = ["JumpRateModelV2", "WhitePaperInterestRateModel"];

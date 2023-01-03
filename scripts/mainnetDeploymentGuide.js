const { ethers } = require("hardhat");

async function main() {
  var unitrollerContract;
  var comptrollerContract;
  var delegateContract;
  var originalcomptrollerAddress;
  var COREContract;
  var JumpRateModelContract;
  var USDCJumpRateModelContract;
  var mUSDContract;
  var mUSDCContract;
  var fedContract;
  var oracleContract;
  var mEtherContract;
  var WhitePaperModelContract;

  ////////////////////////////////////////
  //Contract Deployments
  ////////////////////////////////////////

  //Deploy Oracle
  const oracleFactory = await ethers.getContractFactory("Oracle");
  oracleContract = await oracleFactory.deploy();
  await oracleContract.deployTransaction.wait();
  console.log("Oracle Deployed");

  //Deploy Delegate (cERC20 Implementation)
  const delegateFactory = await ethers.getContractFactory("CErc20Delegate");
  delegateContract = await delegateFactory.deploy();
  await delegateContract.deployTransaction.wait();

  // Deploy Comptroller
  const comptrollerFactory = await ethers.getContractFactory("Comptroller");
  comptrollerContract = await comptrollerFactory.deploy();
  await comptrollerContract.deployTransaction.wait();
  originalcomptrollerAddress = comptrollerContract.address;

  // Deploy Unitroller
  const unitrollerFactory = await ethers.getContractFactory(
    "contracts/Comptroller/Unitroller.sol:Unitroller"
  );
  unitrollerContract = await unitrollerFactory.deploy();
  await unitrollerContract.deployTransaction.wait();

  //Set Implementation for Unitroller
  const setPendingImplementationTx =
    await unitrollerContract._setPendingImplementation(
      comptrollerContract.address
    );
  await setPendingImplementationTx.wait();
  const setApproveNewImplementationTx = await comptrollerContract._become(
    unitrollerContract.address
  );
  await setApproveNewImplementationTx.wait();

  //We are addressing the Unitroller, which delegates to comptroller
  comptrollerContract = await ethers.getContractAt(
    "Comptroller",
    unitrollerContract.address
  );
  console.log("Comptroller Deployed");

  // Deploy CORE (ERC20 token)
  const COREFactory = await ethers.getContractFactory("ERC20");
  COREContract = await COREFactory.deploy("CORE USD", "CORE", "18");
  await COREContract.deployTransaction.wait();

  // Deploy InterestRateModels
  //For CORE (Fuse pool)
  const JumpRateModelFactory = await ethers.getContractFactory(
    "JumpRateModelV2"
  );
  JumpRateModelContract = await JumpRateModelFactory.deploy(
    "0", //uint baseRatePerYear
    "49999999998268800", //uint multiplierPerYear
    "1089999999998841600", //uint jumpMultiplierPerYear
    "800000000000000000" //uint kink_
  );
  await JumpRateModelContract.deployTransaction.wait();

  //For USDC (Fuse pool)
  USDCJumpRateModelContract = await JumpRateModelFactory.deploy(
    "0", //uint baseRatePerYear
    "49999999998268800", //uint multiplierPerYear
    "1089999999998841600", //uint jumpMultiplierPerYear
    "800000000000000000" //uint kink_
  );
  await USDCJumpRateModelContract.deployTransaction.wait();

  // For ETH
  const WhitePaperModelFactory = await ethers.getContractFactory(
    "WhitePaperInterestRateModel"
  );
  WhitePaperModelContract = await WhitePaperModelFactory.deploy(
    "19999999999728000",
    "99999999998640000"
  );
  await WhitePaperModelContract.deployTransaction.wait();
  console.log("Interest Rates Deployed");

  //Deploy mUSD
  const mUSDFactory = await ethers.getContractFactory("CErc20Delegator");
  mUSDContract = await mUSDFactory.deploy(
    COREContract.address, //address underlying_
    unitrollerContract.address, //ComptrollerInterface comptroller_
    JumpRateModelContract.address, //InterestRateModel interestRateModel_
    "200000000000000000", //uint initialExchangeRateMantissa_
    "mantle deposited CORE", //string memory name_
    "mUSD", //string memory symbol_
    "8", //uint8 decimals_
    delegateContract.address, //address implementation
    0 //Unused data entry
  );
  await mUSDContract.deployTransaction.wait();

  //Deploy mUSDC
  mUSDCContract = await mUSDFactory.deploy(
    "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8", //address underlying_ (USDC on Arbitrum)
    unitrollerContract.address, //ComptrollerInterface comptroller_
    USDCJumpRateModelContract.address, //InterestRateModel interestRateModel_
    "200000000000000000", //uint initialExchangeRateMantissa_
    "mantle deposited USDC", //string memory name_
    "mUSDC", //string memory symbol_
    "8", //uint8 decimals_
    delegateContract.address, //address implementation
    0 //Unused data entry
  );
  await mUSDCContract.deployTransaction.wait();

  //Deploy mETH
  const mEtherFactory = await ethers.getContractFactory("CEther");
  mEtherContract = await mEtherFactory.deploy(
    unitrollerContract.address, //ComptrollerInterface comptroller_
    WhitePaperModelContract.address, //InterestRateModel interestRateModel_
    "200000000000000000", //uint initialExchangeRateMantissa_
    "mantle deposited ETH", //string memory name_
    "mETH", //string memory symbol_
    "8" //uint8 decimals_
  );
  await mEtherContract.deployTransaction.wait();
  console.log("mTokens Deployed");

  //Deploy Fed
  const fedFactory = await ethers.getContractFactory("Fed");
  fedContract = await fedFactory.deploy(mUSDContract.address); //CErc20 ctoken_
  await fedContract.deployTransaction.wait();
  console.log("Fed Deployed");

  const stabilizerFactory = await ethers.getContractFactory(
    "contracts/InverseFinance/Stabilizer.sol:Stabilizer"
  );
  stabilizerContract = await stabilizerFactory.deploy(
    COREContract.address, // CORE address
    "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", // DAI (Arbitrum)
    100, // 1% buy fee
    100, // 1% sell fee
    ethers.utils.parseEther("15000000") // 15 mil supply
  );

  ////////////////////////////////////////
  //Configurations
  ////////////////////////////////////////

  //Set USDC price feed (Chainlink)
  const setUSDCPriceTx = await oracleContract.setFeed(
    mUSDCContract.address,
    "0x50834f3163758fcc1df9973b6e91f0f0f0434ad3",
    "6"
  );
  await setUSDCPriceTx.wait();
  //Set fixed 1USD price feed for CORE
  const setSynthPriceTx = await oracleContract.setFixedPrice(
    mUSDContract.address,
    "1000000000000000000"
  );
  await setSynthPriceTx.wait();
  //Set Ethereum price feed (Chainlink)
  const setEthPriceTx = await oracleContract.setFeed(
    mEtherContract.address,
    "0x639fe6ab55c921f74e7fac1ee960c0b6293ba612",
    "18"
  );
  await setEthPriceTx.wait();

  console.log("Price Feeds configured");

  //Set the oracle for price queries
  const setOracleTx = await comptrollerContract._setPriceOracle(
    oracleContract.address
  );
  await setOracleTx.wait();
  //Set the close Factor
  const setCloseFactorTx = await comptrollerContract._setCloseFactor(
    ethers.utils.parseEther("0.5")
  );
  await setCloseFactorTx.wait();
  //Set Liquidation Incentive
  const setLiquidationIncentiveTx =
    await comptrollerContract._setLiquidationIncentive(
      ethers.utils.parseEther("5")
    );
  await setLiquidationIncentiveTx.wait();
  //Create CORE Market
  const setERC20MarketTx = await comptrollerContract._supportMarket(
    mUSDContract.address
  );
  await setERC20MarketTx.wait();
  //Create ETH Market
  const setEthMarketTx = await comptrollerContract._supportMarket(
    mEtherContract.address
  );
  await setEthMarketTx.wait();
  //Create USDC Market
  const setUSDCMarketTx = await comptrollerContract._supportMarket(
    mUSDCContract.address
  );
  await setUSDCMarketTx.wait();
  //Set the CollateralFactor for CORE
  const setCollateralFactor1Tx = await comptrollerContract._setCollateralFactor(
    mUSDContract.address,
    ethers.utils.parseEther("0.25")
  );
  await setCollateralFactor1Tx.wait();
  //Set the CollateralFactor for Eth
  const setCollateralFactor2Tx = await comptrollerContract._setCollateralFactor(
    mEtherContract.address,
    ethers.utils.parseEther("0.75")
  );
  await setCollateralFactor2Tx.wait();
  //Set the CollateralFactor for USDC
  const setCollateralFactor3Tx = await comptrollerContract._setCollateralFactor(
    mUSDCContract.address,
    ethers.utils.parseEther("0.85")
  );
  await setCollateralFactor3Tx.wait();
  //Set the IMFFactor for CORE
  const setIMFFactor1Tx = await comptrollerContract._setIMFFactor(
    mUSDContract.address,
    ethers.utils.parseEther("0.04")
  );
  await setIMFFactor1Tx.wait();
  //Set the IMFFactor for ETH
  const setIMFFactor2Tx = await comptrollerContract._setIMFFactor(
    mEtherContract.address,
    ethers.utils.parseEther("0.04")
  );
  await setIMFFactor2Tx.wait();
  //Set the IMFFactor for USDC
  const setIMFFactor3Tx = await comptrollerContract._setIMFFactor(
    mUSDCContract.address,
    ethers.utils.parseEther("0.04")
  );
  await setIMFFactor3Tx.wait();
  //Set the Maximum amount of borrowed CORE tokens (10mil)
  const setBorrowCapTx = await comptrollerContract._setMarketBorrowCaps(
    [mUSDContract.address],
    [ethers.utils.parseEther("10000000")]
  );
  await setBorrowCapTx.wait();
  console.log("Comptroller Configured");

  //Set the ReserveFactor for CORE
  const setReserveFactor1Tx = await mUSDContract._setReserveFactor(
    ethers.utils.parseEther("0.5")
  );
  await setReserveFactor1Tx.wait();
  //Set the ReserveFactor for ETH
  const setReserveFactor2Tx = await mEtherContract._setReserveFactor(
    ethers.utils.parseEther("0.5")
  );
  await setReserveFactor2Tx.wait();
  //Set the ReserveFactor for USDC
  const setReserveFactor3Tx = await mUSDCContract._setReserveFactor(
    ethers.utils.parseEther("0.5")
  );
  await setReserveFactor3Tx.wait();
  console.log("mTokens configured");

  //Allow Fed to mint the CORE
  var addMinterTx = await COREContract.addMinter(fedContract.address);
  await addMinterTx.wait();
  console.log("Test Minters set");

  //fed expension (minting 10mil CORE tokens and depositing them into the protocol)
  const expansionTx = await fedContract.expansion(
    ethers.utils.parseEther("10000000")
  );
  expansionTx.wait();
  console.log("Fed Expanded");

  //In order for the subgraph to work we accrue interest once for every mToken
  var accrueTx = await mUSDContract.accrueInterest();
  await accrueTx.wait();
  var accrueTx = await mUSDCContract.accrueInterest();
  await accrueTx.wait();
  var accrueTx = await mEtherContract.accrueInterest();
  await accrueTx.wait();
  console.log("Interests accrued");

  //Print all addresses
  console.log(
    "----------------------------------------------------------------------------"
  );
  console.log("Deployed Addresses:");
  console.log(
    "----------------------------------------------------------------------------"
  );
  console.log("Comptroller:               " + originalcomptrollerAddress);
  console.log("Unitroller:                " + unitrollerContract.address);
  console.log("Oracle:                    " + oracleContract.address);
  console.log("Implementation             " + delegateContract.address);
  console.log("Fed:                       " + fedContract.address);
  console.log("CORE:                      " + COREContract.address);
  console.log("CORE interestrate model:   " + JumpRateModelContract.address);
  console.log("mUSD:                     " + mUSDContract.address);
  console.log("Eth interest rate model:   " + WhitePaperModelContract.address);
  console.log("mETH:                     " + mEtherContract.address);
  console.log(
    "USDC interest rate model:  " + USDCJumpRateModelContract.address
  );
  console.log("mUSDC:                    " + mUSDCContract.address);
  console.log(
    "----------------------------------------------------------------------------"
  );
  console.log(
    "----------------------------------------------------------------------------"
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

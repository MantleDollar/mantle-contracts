# Quickstart
`yarn`

Get the addresses for the various assets and oracles, and which asset will be used for PSM. If needed, deploy a simple CW20<>ERC20 wrapper for USDX if that's the main asset for the PSM
https://feeds.witnet.io/kava/kava-mainnet_kava-usd_6

Not sure which bridged assets are the most popular - so figuring which asset for ETH and USDC is used here. 

If we need an adapter for whatever oracle is used, that as well (if it isn't chainlink)

# BAO Markets (a.k.a. HardSynths)

For those who want to dive into the protocol early we recommend familiarizing yourself with the compound protocol:

https://compound.finance/docs (Excellent documentation)

and after that Inverse Finance:

https://github.com/InverseFinance/anchor

The specific configurations and changes made to the protocol can be viewed in the Bao Docs:

https://docs.bao.finance/franchises/bao-markets


# Deployed Ethereum Mainnet Contracts

Deployed Addresses:
----------------------------------------------------------------------------
Comptroller:               0xF980d9cD6941a5c3A096d0c14A4026Ae87d7107f
Unitroller:                0x7170D38B90f4b0D097E0a24174aD74fA42d07b81
Oracle:                    0x248AC1493b71536D1011e8d860D6c0e3EE3Cc45B
Implementation             0x1B200D8dC5e909f0c11715D9778986db35eDbe26
Fed:                       0xA7aA246B6Bd4Cb2aFCc706570faA0816651dE19A
CORE:                      0x00DD797A05a963bAda6ccF02EeFf6749a8d8A2d2
CORE interestrate model:   0xCFc0AFfE89cC6A4A1C9ca6cc51D5D7777f8659f7
mUSD:                     0xcb1346CAbDE763Af950b602a2f18fCD27d96E4C2
Eth interest rate model:   0x89C8e729d30AEf7D45122CE3b852aBC75cac3FbC
mETH:                     0x919E7642D60c696E42393C4176Fe10F2217042Ef
USDC interest rate model:  0x1308753E4aDFd00064C3DF4aAd94503622bd5f84
mUSDC:                    0xaFa5e1Ea2D1E0FE58DC2a69502F39bcf7b2A39Eb
Stabilizer:               0x2bfa32521f16c6fdec5755521e547c0212244a5a
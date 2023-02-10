pragma solidity ^0.8.0;
import {Ownable} from "../Liquidator/OpenZeppelinInterfaces.sol";

interface IPriceOracle {
    function consultPrice(
        address token,
        uint256 maxAge
    ) external view returns (uint112 price);
}

interface ICErc20 {
    function underlying() external view returns (address);
}

contract AdrastiaPriceOracle is Ownable {
    mapping(address => uint256) backupPrices;
    event PricePosted(
        address asset,
        uint256 previousPriceMantissa,
        uint256 requestedPriceMantissa,
        uint256 newPriceMantissa
    );
    event ExpiredPrice(address asset, address oracle);
    event Price(uint112 price);

    address public aggregatedOracle =
        0x51d3d22965Bb2CB2749f896B82756eBaD7812b6d;
    address public usdPeggedAggregatedOracle =
        0xd850F64Eda6a62d625209711510f43cD49Ef8798;
    address public WEVMOS = 0xD4949664cD82660AaE99bEdc034a0deA8A0bd517;

    function setWEVMOSAddress(address wevmos) public onlyOwner {
        WEVMOS = wevmos;
    }

    function setOracleAddress(
        address aggregated,
        address usdPeggedAggregated
    ) public onlyOwner {
        require(aggregated != address(0), "Aggregated addr not set");
        require(
            usdPeggedAggregated != address(0),
            "usdPeggedAggregated addr not set"
        );
        aggregatedOracle = aggregated;
        usdPeggedAggregatedOracle = usdPeggedAggregated;
    }

    /**
     * @notice Get the underlying price of a cToken asset
     * @param cToken The cToken to get the underlying price of
     * @return The underlying asset price mantissa (scaled by 1e18).
     *  Zero means the price is unavailable.
     */
    function getUnderlyingPrice(address cToken) public view returns (uint256) {
        address underlyingAsset = ICErc20(address(cToken)).underlying();
        uint256 evmosPrice;
        uint256 assetPrice;
        // Gets the price of `token` with the requirement that the price is 2 hours old or less
        try
            IPriceOracle(usdPeggedAggregatedOracle).consultPrice(
                underlyingAsset,
                2 hours
            )
        returns (uint112 adrastiaPrice) {
            evmosPrice = uint256(adrastiaPrice);
        } catch (bytes memory) {
            evmosPrice = backupPrices[WEVMOS];
        }
        // USD Pegged Aggregated Oracle is denominated with 6 decimals
        if (underlyingAsset == WEVMOS) {
            return evmosPrice * 1e12;
        }
        try
            IPriceOracle(aggregatedOracle).consultPrice(
                underlyingAsset,
                2 hours
            )
        returns (uint112 adrastiaPrice) {
            assetPrice = uint256(adrastiaPrice);
        } catch (bytes memory) {
            assetPrice = backupPrices[underlyingAsset];
        }
        return uint256((evmosPrice * assetPrice) / 1e6);
    }

    /**
     * @notice set the price of an asset
     * @param asset The address of the asset
     * @param price The price to set the asset to:
     * If WEVMOS, set the price with 6 decimals, otherwise use 18 decimals but denominate the price in WEVMOS
     */
    function setDirectPrice(address asset, uint256 price) public onlyOwner {
        emit PricePosted(asset, backupPrices[asset], price, price);
        backupPrices[asset] = price;
    }

    /**
     * @notice set the price of the underlying asset of the ctoken
     * @param cToken The address of the cToken
     * @param price The price to set the asset to:
     * If WEVMOS, set the price with 6 decimals, otherwise use 18 decimals but denominate the price in WEVMOS
     */
    function setUnderlyingPrice(
        address cToken,
        uint256 price
    ) public onlyOwner {
        address asset = ICErc20(address(cToken)).underlying();
        emit PricePosted(asset, backupPrices[asset], price, price);
        backupPrices[asset] = price;
    }
}

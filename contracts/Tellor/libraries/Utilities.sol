pragma solidity ^0.5.0;

//Functions for retrieving min and Max in 51 length array (requestQ)
//Taken partly from: https://github.com/modular-network/ethereum-libraries-array-utils/blob/master/contracts/Array256Lib.sol

library Utilities {
    /**
    * @dev Returns the minimum value in an array.
    */
    function getMax(uint256[51] memory data) internal pure returns (uint256 max, uint256 maxIndex) {
        max = data[1];
        maxIndex;
        for (uint256 i = 1; i < data.length; i++) {
            if (data[i] > max) {
                max = data[i];
                maxIndex = i;
            }
        }
    }

    /**
    * @dev Returns the minimum value in an array.
    */
    function getMin(uint256[51] memory data) internal pure returns (uint256 min, uint256 minIndex) {
        minIndex = data.length - 1;
        min = data[minIndex];
        for (uint256 i = data.length - 1; i > 0; i--) {
            if (data[i] < min) {
                min = data[i];
                minIndex = i;
            }
        }
    }

}

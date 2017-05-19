pragma solidity 0.4.11;


/// @title Math library - Allows calculation of logarithmic and exponential functions
/// @author Alan Lu - <alan.lu@gnosis.pm>
/// @author Stefan George - <stefan@gnosis.pm>
library Math {

    /*
     *  Constants
     */
    // This is equal to 1 in our calculations
    uint public constant ONE = 0x10000000000000000;

    /*
     *  Public functions
     */
    /// @dev Returns natural exponential function value of given x
    /// @param x x
    /// @return Returns e**x
    function exp(uint x)
        public
        constant
        returns (uint)
    {
        /* This is equivalent to ln(2) */
        uint ln2 = 0xb17217f7d1cf79ac;
        uint y = x * ONE / ln2;
        uint shift = 2**(y / ONE);
        uint z = y % ONE;
        uint zpow = z;
        uint result = ONE;
        result += 0xb172182739bc0e46 * zpow / ONE;
        zpow = zpow * z / ONE;
        result += 0x3d7f78a624cfb9b5 * zpow / ONE;
        zpow = zpow * z / ONE;
        result += 0xe359bcfeb6e4531 * zpow / ONE;
        zpow = zpow * z / ONE;
        result += 0x27601df2fc048dc * zpow / ONE;
        zpow = zpow * z / ONE;
        result += 0x5808a728816ee8 * zpow / ONE;
        zpow = zpow * z / ONE;
        result += 0x95dedef350bc9 * zpow / ONE;
        result += 0x16aee6e8ef;
        return shift * result;
    }

    /// @dev Returns natural logarithm value of given x
    /// @param x x
    /// @return Returns ln(x)
    function ln(uint x)
        public
        constant
        returns (uint)
    {
        uint log2e = 0x171547652b82fe177;
        // binary search for floor(log2(x))
        uint ilog2 = floorLog2(x);
        // lagrange interpolation for log2
        uint z = x / (2**ilog2);
        uint zpow = ONE;
        uint const = ONE * 10;
        uint result = const;
        result -= 0x443b9c5adb08cc45f * zpow / ONE;
        zpow = zpow * z / ONE;
        result += 0xf0a52590f17c71a3f * zpow / ONE;
        zpow = zpow * z / ONE;
        result -= 0x2478f22e787502b023 * zpow / ONE;
        zpow = zpow * z / ONE;
        result += 0x48c6de1480526b8d4c * zpow / ONE;
        zpow = zpow * z / ONE;
        result -= 0x70c18cae824656408c * zpow / ONE;
        zpow = zpow * z / ONE;
        result += 0x883c81ec0ce7abebb2 * zpow / ONE;
        zpow = zpow * z / ONE;
        result -= 0x81814da94fe52ca9f5 * zpow / ONE;
        zpow = zpow * z / ONE;
        result += 0x616361924625d1acf5 * zpow / ONE;
        zpow = zpow * z / ONE;
        result -= 0x39f9a16fb9292a608d * zpow / ONE;
        zpow = zpow * z / ONE;
        result += 0x1b3049a5740b21d65f * zpow / ONE;
        zpow = zpow * z / ONE;
        result -= 0x9ee1408bd5ad96f3e * zpow / ONE;
        zpow = zpow * z / ONE;
        result += 0x2c465c91703b7a7f4 * zpow / ONE;
        zpow = zpow * z / ONE;
        result -= 0x918d2d5f045a4d63 * zpow / ONE;
        zpow = zpow * z / ONE;
        result += 0x14ca095145f44f78 * zpow / ONE;
        zpow = zpow * z / ONE;
        result -= 0x1d806fc412c1b99 * zpow / ONE;
        zpow = zpow * z / ONE;
        result += 0x13950b4e1e89cc * zpow / ONE;
        return (ilog2 * ONE + result - const) * ONE / log2e;
    }

    /// @dev Returns base 2 logarithm value of given x
    /// @param x x
    /// @return Returns logarithmic value
    function floorLog2(uint x)
        public
        constant
        returns (uint lo)
    {
        lo = 0;
        uint y = x / ONE;
        uint hi = 191;
        uint mid = (hi + lo) / 2;
        while ((lo + 1) != hi) {
            if (y < 2**mid)
                hi = mid;
            else
                lo = mid;
            mid = (hi + lo) / 2;
        }
    }

    /// @dev Returns if an add operation causes an overflow
    /// @param a First addend
    /// @param b Second addend
    /// @return Did an overflow occur?
    function safeToAdd(uint a, uint b)
        public
        returns (bool)
    {
        return (a + b >= a);
    }

    /// @dev Returns if an subtraction operation causes an overflow
    /// @param a Minuend
    /// @param b Subtrahend
    /// @return Did an overflow occur?
    function safeToSubtract(uint a, uint b)
        public
        returns (bool)
    {
        return (b <= a);
    }
}

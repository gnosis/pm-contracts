pragma solidity 0.4.11;


/// @title Math library - Allows calculation of logarithmic and exponential functions
/// @author Alan Lu - <alan.lu@gnosis.pm>
/// @author Stefan George - <stefan@gnosis.pm>
library Math {

    /*
     *  Constants
     */
    // This is equal to 1 in our calculations
    uint public constant ONE_SHIFT = 64;
    uint public constant ONE =  0x10000000000000000;
    uint public constant LN2 = 0xb17217f7d1cf79ac;
    uint public constant LOG2_E = 0x171547652b82fe177;

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
        // Transform so that e^x = 2^x
        x = x * ONE / LN2;
        uint shift = x / ONE;

        // 2^x = 2^whole(x) * 2^frac(x)
        //       ^^^^^^^^^^ is a bit shift
        // so Taylor expand on z = frac(x)
        uint z = x % ONE;

        // 2^x = 1 + (ln 2) x + (ln 2)^2/2! x^2 + ...
        //
        // Can generate the z coefficients using mpmath and the following lines
        // >>> from mpmath import mp
        // >>> mp.dps = 100
        // >>> ONE =  0x10000000000000000
        // >>> print('\n'.join(hex(int(mp.log(2)**i / mp.factorial(i) * ONE)) for i in range(1, 7)))
        // 0xb17217f7d1cf79ab
        // 0x3d7f7bff058b1d50
        // 0xe35846b82505fc5
        // 0x276556df749cee5
        // 0x5761ff9e299cc4
        // 0xa184897c363c3

        uint zpow = z;
        uint result = ONE;
        result += 0xb17217f7d1cf79ab * zpow / ONE;
        zpow = zpow * z / ONE;
        result += 0x3d7f7bff058b1d50 * zpow / ONE;
        zpow = zpow * z / ONE;
        result += 0xe35846b82505fc5 * zpow / ONE;
        zpow = zpow * z / ONE;
        result += 0x276556df749cee5 * zpow / ONE;
        zpow = zpow * z / ONE;
        result += 0x5761ff9e299cc4 * zpow / ONE;
        zpow = zpow * z / ONE;
        result += 0xa184897c363c3 * zpow / ONE;
        zpow = zpow * z / ONE;
        result += 0xffe5fe2c4586 * zpow / ONE;
        zpow = zpow * z / ONE;
        result += 0x162c0223a5c8 * zpow / ONE;
        zpow = zpow * z / ONE;
        result += 0x1b5253d395e * zpow / ONE;
        zpow = zpow * z / ONE;
        result += 0x1e4cf5158b * zpow / ONE;
        zpow = zpow * z / ONE;
        result += 0x1e8cac735 * zpow / ONE;
        zpow = zpow * z / ONE;
        result += 0x1c3bd650 * zpow / ONE;
        zpow = zpow * z / ONE;
        result += 0x1816193 * zpow / ONE;
        zpow = zpow * z / ONE;
        result += 0x131496 * zpow / ONE;
        zpow = zpow * z / ONE;
        result += 0xe1b7 * zpow / ONE;
        zpow = zpow * z / ONE;
        result += 0x9c7 * zpow / ONE;
        return result << shift;
    }

    /// @dev Returns natural logarithm value of given x
    /// @param x x
    /// @return Returns ln(x)
    function ln(uint x)
        public
        constant
        returns (int)
    {
        require(x > 0);

        // binary search for floor(log2(x))
        int ilog2 = floorLog2(x);

        int z;
        if(ilog2 < 0)
            z = int(x << uint(-ilog2));
        else
            z = int(x >> uint(ilog2));

        int zpow = int(ONE);
        int const = int(ONE) * 10;
        int result = const;
        result -= 0x443b9c5adb08cc45f * zpow / int(ONE);
        zpow = zpow * z / int(ONE);
        result += 0xf0a52590f17c71a3f * zpow / int(ONE);
        zpow = zpow * z / int(ONE);
        result -= 0x2478f22e787502b023 * zpow / int(ONE);
        zpow = zpow * z / int(ONE);
        result += 0x48c6de1480526b8d4c * zpow / int(ONE);
        zpow = zpow * z / int(ONE);
        result -= 0x70c18cae824656408c * zpow / int(ONE);
        zpow = zpow * z / int(ONE);
        result += 0x883c81ec0ce7abebb2 * zpow / int(ONE);
        zpow = zpow * z / int(ONE);
        result -= 0x81814da94fe52ca9f5 * zpow / int(ONE);
        zpow = zpow * z / int(ONE);
        result += 0x616361924625d1acf5 * zpow / int(ONE);
        zpow = zpow * z / int(ONE);
        result -= 0x39f9a16fb9292a608d * zpow / int(ONE);
        zpow = zpow * z / int(ONE);
        result += 0x1b3049a5740b21d65f * zpow / int(ONE);
        zpow = zpow * z / int(ONE);
        result -= 0x9ee1408bd5ad96f3e * zpow / int(ONE);
        zpow = zpow * z / int(ONE);
        result += 0x2c465c91703b7a7f4 * zpow / int(ONE);
        zpow = zpow * z / int(ONE);
        result -= 0x918d2d5f045a4d63 * zpow / int(ONE);
        zpow = zpow * z / int(ONE);
        result += 0x14ca095145f44f78 * zpow / int(ONE);
        zpow = zpow * z / int(ONE);
        result -= 0x1d806fc412c1b99 * zpow / int(ONE);
        zpow = zpow * z / int(ONE);
        result += 0x13950b4e1e89cc * zpow / int(ONE);
        return (ilog2 * int(ONE) + result - const) * int(ONE) / int(LOG2_E);
    }

    /// @dev Returns base 2 logarithm value of given x
    /// @param x x
    /// @return Returns logarithmic value
    function floorLog2(uint x)
        public
        constant
        returns (int lo)
    {
        lo = -64;
        int hi = 193;
        int mid = (hi + lo) / 2;
        while ((lo + 1) != hi) {
            if (mid < 0 && x << uint(-mid) < ONE || mid >= 0 && x >> uint(mid) < ONE )
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

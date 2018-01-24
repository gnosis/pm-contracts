pragma solidity ^0.4.15;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../../contracts/Utils/Math.sol";

contract TestMath {
    function testMathOverloaded() {
        /* Test Overloaded functions using integers */

        //Safe to add int
        Assert.isFalse(Math.safeToAdd(2**256 - 1, 1), "integer overflow unsafe (int)");
        Assert.isTrue(Math.safeToAdd(int(1), int(1)), "safe to add 1+1 (int)");

        //Safe to subtract int
        Assert.isTrue(Math.safeToSub(int(1), int(2)), "signed subtraction possible (int)");
        Assert.isFalse(Math.safeToSub(int(-2**255), int(1)), "integer underflow is unsafe -2**256 - 1 (int)");
        Assert.isTrue(Math.safeToSub(int(1), int(1)), "safe to subtract 1-1 (int)");

        //Safe to multiply int
        Assert.isFalse(Math.safeToMul(int(2**128), int(2**128)), "integer overflow unsafe (int)");
        Assert.isTrue(Math.safeToMul(int(2**256 - 1), int(2)), "safe to multiply (int)");

        //Add int
        Assert.equal(Math.add(int(1), int(1)), int(2), "1+1=2 (int)");

        //Sub int
        Assert.equal(Math.sub(int(1), int(1)), int(0), "1-1=0 (int)");

        //Mul int
        Assert.equal(Math.mul(int(5), int(5)), int(25), "5*5=25 (int)");


        /* Test Overloaded functions using unsigned integers */

        //Safe to add uint
        Assert.isFalse(Math.safeToAdd(2**256 - 1, 1), "uint overflow unsafe (uint)");
        Assert.isTrue(Math.safeToAdd(uint(1), uint(1)), "safe to add 1+1 (uint)");

        //Safe to subtract uint
        Assert.isFalse(Math.safeToSub(uint(1), uint(2)), "negative unsigned subtraction not possible (uint)");
        Assert.isTrue(Math.safeToSub(uint(1), uint(1)), "safe to subtract 1-1 (uint)");

        //Safe to multiply uint
        Assert.isFalse(Math.safeToMul(uint(2**256-1), uint(2)), "not safe to multiply: (2**256-1) = (0 - 1) (uint)");
        Assert.isTrue(Math.safeToMul(uint(2**256-1), uint(2**256-1)+(uint(1))), "safe to multiply (2**256-1 + 1) = (0 + 1) (uint)");

        //Add uint
        Assert.equal(Math.add(uint(1), uint(1)), uint(2), "1+1=2 (uint)");

        //Sub uint
        Assert.equal(Math.sub(uint(1), uint(1)), uint(0), "1-1=0 (uint)");

        //Mul uint
        Assert.equal(Math.mul(uint(5), uint(5)), uint(25), "5*5=25 (uint)");
    }
}

from ..abstract_test import AbstractTestContract
import math


class TestContract(AbstractTestContract):
    """
    run test with python -m unittest contracts.tests.utils.test_math
    """

    def __init__(self, *args, **kwargs):
        super(TestContract, self).__init__(*args, **kwargs)
        self.math = self.create_contract('Utils/Math.sol')

    def test(self):
        # LN
        x = 2
        self.assertAlmostEqual(self.math.ln(x * 2 ** 64) / 2.0 ** 64, math.log(x), places=2)
        # EXP
        x = 10
        self.assertAlmostEqual(self.math.exp(x * 2 ** 64) / 2.0 ** 64, math.exp(x), places=2)
        # Safe to add
        self.assertFalse(self.math.safeToAdd(2**256 - 1, 1))
        self.assertTrue(self.math.safeToAdd(1, 1))
        # Safe to subtract
        self.assertFalse(self.math.safeToSubtract(1, 2))
        self.assertTrue(self.math.safeToSubtract(1, 1))

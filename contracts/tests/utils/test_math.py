from itertools import chain
from functools import partial

import math
import random

from ethereum.tester import TransactionFailed

from ..math_utils import isclose, mp, mpf
from ..abstract_test import AbstractTestContracts


class TestContracts(AbstractTestContracts):

    def __init__(self, *args, **kwargs):
        super(TestContracts, self).__init__(*args, **kwargs)
        self.math = self.create_contract('Utils/Math.sol')

    def test(self):
        ONE = 0x10000000000000000
        RELATIVE_TOLERANCE = 1e-9
        ABSOLUTE_TOLERANCE = 1e-18

        MAX_POWER = int(mp.floor(mp.log(mpf(2**256 - 1) / ONE) * ONE))
        MIN_POWER = int(mp.floor(mp.log(mpf(1) / ONE) * ONE))

        # LN
        self.assertRaises(TransactionFailed, partial(self.math.ln, 0))
        for x in chain(
            (1, ONE, 2**256-1),
            (random.randrange(1, ONE) for _ in range(10)),
            (random.randrange(ONE+1, 2**256) for _ in range(10)),
        ):
            X, actual, expected = (
                mpf(x) / ONE,
                mpf(self.math.ln(x)) / ONE,
                mp.log(mpf(x) / ONE),
            )
            assert X is not None and isclose(actual, expected, rel_tol=RELATIVE_TOLERANCE)

        # EXP
        for x in chain(
            (0, 2448597794190215440622, MAX_POWER),
            (random.randrange(MAX_POWER) for _ in range(10)),
            (MIN_POWER, -497882689251500345055, -1),
            (random.randrange(MIN_POWER, 0) for _ in range(10)),
        ):
            X, actual, expected = (
                mpf(x) / ONE,
                mpf(self.math.exp(x)) / ONE,
                mp.exp(mpf(x) / ONE),
            )
            assert X is not None and isclose(
                actual, expected,
                rel_tol=RELATIVE_TOLERANCE,
                abs_tol=ABSOLUTE_TOLERANCE
            )

        for x in chain(
            (MAX_POWER + 1, 2**255-1),
            (random.randrange(MAX_POWER+1, 2**255) for _ in range(10)),
        ):
            self.assertRaises(TransactionFailed, partial(self.math.exp, x))

        for _ in range(10):
            int_seq = [random.randrange(-2**255, 2**255) for _ in range(10)]
            self.assertEqual(self.math.max(int_seq), max(int_seq))

        # TODO: Provide below tests again. They are not included because of the way function overloading
        # is not exposed to pyethereum.

        # # Safe to add
        # self.assertFalse(self.math.safeToAdd(2**256 - 1, 1))
        # self.assertTrue(self.math.safeToAdd(1, 1))

        # # Safe to subtract
        # self.assertFalse(self.math.safeToSub(1, 2))
        # self.assertTrue(self.math.safeToSub(1, 1))

        # # Safe to multiply
        # self.assertFalse(self.math.safeToMul(2**128, 2**128))
        # self.assertTrue(self.math.safeToMul(2**256//2 - 1, 2))

        # # Add
        # self.assertRaises(TransactionFailed, self.math.add, 2**256 - 1, 1)
        # self.assertEqual(self.math.add(1, 1), 2)

        # # Sub
        # self.assertRaises(TransactionFailed, self.math.sub, 1, 2)
        # self.assertEqual(self.math.sub(1, 1), 0)

        # # Mul
        # self.assertRaises(TransactionFailed, self.math.mul, 2**128, 2**128)
        # self.assertEqual(self.math.mul(5, 5), 25)

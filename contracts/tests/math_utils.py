import math

from mpmath import mp, mpf
mp.dps = 100
mp.pretty=True


if hasattr(math, 'isclose'):
    isclose = math.isclose
else:
    # PEP 485
    def isclose(a, b, rel_tol=1e-9, abs_tol=0.0):
        return abs(a-b) <= max(rel_tol * max(abs(a), abs(b)), abs_tol)

import math

from mpmath import mp, mpf
mp.dps = 100
mp.pretty=True


ONE = 0x10000000000000000


if hasattr(math, 'isclose'):
    isclose = math.isclose
else:
    # PEP 485
    def isclose(a, b, rel_tol=1e-9, abs_tol=0.0):
        return abs(a-b) <= max(rel_tol * max(abs(a), abs(b)), abs_tol)


def lmsr_marginal_price(funding, net_outcome_tokens_sold, outcome_index):
    b = mpf(funding) / mp.log(len(net_outcome_tokens_sold))
    return (
        mp.exp(net_outcome_tokens_sold[outcome_index] / b) /
        sum(
            mp.exp(tokens_sold / b)
            for tokens_sold in net_outcome_tokens_sold
        )
    )

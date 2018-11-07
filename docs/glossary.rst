Glossary
========

Condition
    A question that a specific oracle reports on with a preset number of payout slots. Analogous to events from PM contracts v1.

    For example, a condition with a categorical outcome, that is, one of N outcomes, may have N payout slots, where the resolution of the condition sets one of the slots to receive the full payout.

    Another example: a condition with a scalar outcome, that is an outcome X in some range [A, B], may have two payout slots which correspond to the ends of the range A and B. Both slots are set to receive a proportion of the payout according to how close the outcome X is to A or B.

    Identified by hash(oracle . questionId . payoutSlotCount)

Outcome
    In the context of a condition, the specified oracle’s answer to the question.

Collateral Token
    ERC20 token used to create stake in positions.

Condition Resolution
    The process in which an oracle reports an outcome for a condition, setting the payout for each of the condition’s payout slots.

Payout Slot
    Defines the redemption rate of payout stake. Payout stake converts to a proportion of collateral depending on the outcomes of a set of conditions. Analogous to outcome tokens from v1.

Payout Collection
    A set of conditions, along with a non-empty proper subset of payout slots for each condition. (Represents a combination of one or many payout slots from multiple conditions.)

    This refers to potentially many conditions whereas a payout slot refers to one condition.

    This is identified by a sum({ hash(conditionId . indexSet) for each pair of (condition, subsets of payout slots) }).

Index Set
    A bit array that represents a subset of payout slots in one condition.

Root Payout Collection
    A payout collection based off of only a single condition. Pays out depending on the outcome of the condition.

Non-Root Payout Collection
    A payout collection based off of multiple conditions. Pays out depending on all of the outcomes of the multiple conditions.

Payout Collection Depth
    The number of conditions a payout collection is based off of. Terminology is chosen because payout collections form a DAG which is very tree-like. Shallow payout collections have few conditions, and deep payout collections have many conditions.

    Although a payout slot with depth zero is not defined, one may think of that slot as simply corresponding to the collateral token.

Atomic Payout Collection
    A payout collection is atomic with respect to a set of conditions if it is contingent on all of the conditions in that set. Equivalently, a payout collection is atomic if its depth equals the number of conditions in the set.

Payout Stake
    For a given payout collection, a stakeholder may express a belief in what that payout collection of payout slots represents by holding stake in that slot.

    For non-root payout collections, redemption will convert stake into shallower stake.

    For root payout collections, redemption will convert stake into collateral.

    This is identified by the combination of collateralToken and collectionId ( h(collateralToken + payoutCollectionId)).

Position
    The combination of a collateralToken and a payoutCollectionId.

Splitting a Position
    Stakeholders can split a position on an optional payout collection and a condition.

    If a payout collection is not given, the stakeholder puts up an amount of collateral to get an equal amount of stake in each of the condition’s root payout slots.

    If a payout slot is given, the stakeholder gives up an amount of stake in a payout slot in exchange for an equal amount of stake in each child payout slot of the given payout slot and the condition’s payout slots.

Merging a Position
    Basically the opposite of splitting a position. Stakeholders can merge a position on an optional payout slot and a condition.

    If a payout slot is not given, the stakeholder puts up an equal amount of stake in each of the condition’s root payout slots to receive collateral.

    If a payout slot is given, the stakeholder gives up an equal amount of stake in each child payout slot of the given payout slot and the condition’s payout slots in exchange for that amount of stake in the given payout slot.

Collection
    A specific subset of the stakeholders position.

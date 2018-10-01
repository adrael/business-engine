import { List } from "immutable";
import { isNil } from "lodash";
import Optional from "typescript-optional";
import { VError } from "verror";
import { BusinessRuleError } from "./BusinessRuleError";
import { BusinessRuleMode } from "./BusinessRuleMode";
import { IBusinessRule } from "./IBusinessRule";

export class BusinessRuleHelper {
    public static checkOne<I>(
        mode: BusinessRuleMode,
        item: I,
        businessRule: IBusinessRule<I>
    ): Optional<BusinessRuleError<I>> {
        return BusinessRuleHelper.check(mode, item, List([businessRule]));
    }

    public static check<I>(
        mode: BusinessRuleMode,
        item: I,
        businessRules: List<IBusinessRule<I>>
    ): Optional<BusinessRuleError<I>> {
        if (isNil(mode) || isNil(item) || !List.isList(businessRules)) {
            const error = new ReferenceError(
                `(mode, item, businessRules) properties must be properly defined. Got: (${mode}, ${item}, ${businessRules})`
            );
            throw new VError(error, `${this.constructor.name} check failed`);
        }

        for (const businessRule of businessRules.toArray()) {
            if (
                !businessRule.isExecutable(mode) ||
                !businessRule.isApplicable(item)
            ) {
                continue;
            }

            const checkResult: Optional<
                BusinessRuleError<I>
            > = businessRule.check(mode, item);

            if (checkResult.isPresent) {
                return checkResult;
            }
        }

        return Optional.empty();
    }

    public static applyBusinessRules<I>(
        mode: BusinessRuleMode,
        item: I,
        businessRules: List<IBusinessRule<I>>
    ): Optional<BusinessRuleError<I>> {
        const result = BusinessRuleHelper.check(mode, item, businessRules);

        result.ifPresent((error: BusinessRuleError<I>) => {
            throw error.raise();
        });

        return result;
    }
}

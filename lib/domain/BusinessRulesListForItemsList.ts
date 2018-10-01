import { List } from "immutable";
import { isFunction, isNil, isString } from "lodash";
import Optional from "typescript-optional";
import { VError } from "verror";
import { BusinessRuleError } from "./BusinessRuleError";
import { BusinessRuleHelper } from "./BusinessRuleHelper";
import { BusinessRuleMode } from "./BusinessRuleMode";
import { IBusinessRule } from "./IBusinessRule";

export class BusinessRulesListForItemsList<E, I> implements IBusinessRule<E> {
    private readonly itemsAccessor: Function | string;
    private readonly businessRules: List<IBusinessRule<I>>;

    constructor(
        itemsAccessor: Function | string,
        ...businessRules: Array<IBusinessRule<I>>
    ) {
        if (!isFunction(itemsAccessor) && !isString(itemsAccessor)) {
            const error = new TypeError(
                `itemsAccessor is not a function nor a string: ${itemsAccessor}`
            );
            throw new VError(error, "BusinessRulesBagForItems creation failed");
        }

        this.itemsAccessor = itemsAccessor;
        this.businessRules = List(
            businessRules.filter(
                (businessRule: IBusinessRule<I>) => !isNil(businessRule)
            )
        );
    }

    public isApplicable(__object: E): boolean {
        return true;
    }

    public isExecutable(__mode: BusinessRuleMode): boolean {
        return true;
    }

    public check(
        mode: BusinessRuleMode,
        object: E
    ): Optional<BusinessRuleError<E>> {
        let items: Array<I> | List<I>;

        if (isFunction(this.itemsAccessor)) {
            items = this.itemsAccessor.apply(object, [object]);
        } else {
            items = (<any>object)[<string>this.itemsAccessor];
        }

        if (isNil(items)) {
            return Optional.empty();
        }

        if (List.isList(items)) {
            items = (<List<I>>items).toArray();
        }

        for (const item of <Array<I>>items) {
            const checkResult: Optional<BusinessRuleError<E>> = this.checkItem(
                mode,
                item
            );

            if (checkResult.isPresent) {
                return checkResult;
            }
        }

        return Optional.empty();
    }

    private checkItem(
        mode: BusinessRuleMode,
        item: I
    ): Optional<BusinessRuleError<E>> {
        return BusinessRuleHelper.check(mode, item, this.businessRules);
    }
}

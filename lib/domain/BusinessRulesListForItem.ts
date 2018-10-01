import { List } from "immutable";
import { isFunction, isString, isNil } from "lodash";
import Optional from "typescript-optional";
import { VError } from "verror";
import { BusinessRuleError } from "./BusinessRuleError";
import { BusinessRuleHelper } from "./BusinessRuleHelper";
import { BusinessRuleMode } from "./BusinessRuleMode";
import { IBusinessRule } from "./IBusinessRule";

export class BusinessRulesListForItem<E, I> implements IBusinessRule<E> {
    private readonly itemAccessor: Function | string;
    private readonly businessRules: List<IBusinessRule<I>>;

    constructor(
        itemAccessor: Function | string,
        ...businessRules: Array<IBusinessRule<I>>
    ) {
        if (!isFunction(itemAccessor) && !isString(itemAccessor)) {
            const error = new TypeError(
                `itemsAccessor is not a function nor a string: ${itemAccessor}`
            );
            throw new VError(error, `${this.constructor.name} creation failed`);
        }

        this.itemAccessor = itemAccessor;
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
        let value: I;

        if (isFunction(this.itemAccessor)) {
            value = this.itemAccessor.apply(object, [object]);
        } else {
            value = (<any>object)[<string>this.itemAccessor];
        }

        return BusinessRuleHelper.check<I>(mode, value, this.businessRules);
    }
}

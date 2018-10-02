import { List } from "immutable";
import { BusinessRuleHelper } from "./BusinessRuleHelper";
import { BusinessRuleMode } from "./BusinessRuleMode";
import { IBusinessRule } from "./IBusinessRule";

export abstract class BusinessRuleService<T> {
    protected readonly businessRules: List<IBusinessRule<T>> = List();

    protected checkForCreation(item: T): void {
        BusinessRuleHelper.applyBusinessRules(
            BusinessRuleMode.CREATE,
            item,
            this.businessRules
        );
    }

    protected checkForUpdate(item: T): void {
        BusinessRuleHelper.applyBusinessRules(
            BusinessRuleMode.UPDATE,
            item,
            this.businessRules
        );
    }
}

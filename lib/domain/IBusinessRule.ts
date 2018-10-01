import Optional from "typescript-optional";
import { BusinessRuleError } from "./BusinessRuleError";
import { BusinessRuleMode } from "./BusinessRuleMode";

export interface IBusinessRule<T> {
    /**
     * Indicates if the object is concerned by the BusinessRule.
     */
    isExecutable(mode: BusinessRuleMode): boolean;

    /**
     * Indicates if the BusinessRule is applicable on the data.
     * This method assumes the object is not null.
     */
    isApplicable(data: T): boolean;

    /**
     * Checks the validity of the object knowing the mode.
     * Returns an optional BusinessRuleError<E>
     */
    check(mode: BusinessRuleMode, entity: T): Optional<BusinessRuleError<T>>;
}

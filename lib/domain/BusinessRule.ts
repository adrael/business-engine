import Optional from "typescript-optional";
import { VError } from "verror";
import { BusinessRuleError } from "./BusinessRuleError";
import {
    BUSINESS_RULE_MODE_VALUES,
    BusinessRuleMode
} from "./BusinessRuleMode";
import { IBusinessRule } from "./IBusinessRule";

export abstract class BusinessRule<E> implements IBusinessRule<E> {
    private readonly mode: BusinessRuleMode;

    constructor(mode: BusinessRuleMode = BusinessRuleMode.ANY) {
        this.mode = mode;
    }

    public getMode(): BusinessRuleMode {
        return this.mode;
    }

    public isExecutable(mode: BusinessRuleMode): boolean {
        return mode === this.mode || BusinessRuleMode.ANY === this.mode;
    }

    public isApplicable(__entity: E): boolean {
        return true;
    }

    public validate(entity: E): Optional<BusinessRuleError<E>> {
        return this.check(this.mode, entity);
    }

    public check(
        mode: BusinessRuleMode,
        entity: E
    ): Optional<BusinessRuleError<E>> {
        if (BusinessRuleMode.CREATE === mode) {
            return this.checkForCreation(entity);
        }

        if (BusinessRuleMode.UPDATE === mode) {
            return this.checkForUpdate(entity);
        }

        const error = new ReferenceError(
            `Invalid mode supplied: ${mode}. Valid modes are ${BUSINESS_RULE_MODE_VALUES}.`
        );
        throw new VError(error, `${this.constructor.name} check failed`);
    }

    protected abstract checkForUpdate(
        entity: E
    ): Optional<BusinessRuleError<E>>;

    protected abstract checkForCreation(
        entity: E
    ): Optional<BusinessRuleError<E>>;
}

import { isNil } from "lodash";
import Optional from "typescript-optional";
import { BusinessRule, BusinessRuleMode } from "../..";
import { BusinessRuleError } from "../../domain/BusinessRuleError";

export class ObjectPropertyRequiredRule<T> extends BusinessRule<T> {
    private readonly property: string;

    constructor(mode: BusinessRuleMode, property: string) {
        super(mode);

        this.property = property;
    }

    protected checkForCreation(object: T): Optional<BusinessRuleError<T>> {
        if (isNil((<any>object)[ this.property ])) {
            return Optional.ofNonNull(this.buildError());
        }

        return Optional.empty();
    }

    protected checkForUpdate(object: T): Optional<BusinessRuleError<T>> {
        return this.checkForCreation(object);
    }

    private buildError(): BusinessRuleError<T> {
        return new BusinessRuleError<T>("common.errors.property.object.required", "property required")
            .set("PROPERTY", this.property);
    }
}

import { isNil } from "lodash";
import { v4 as uuid } from "uuid";
import { BusinessRuleException } from "./BusinessRuleException";

export class BusinessRuleError<T> {
    public readonly uuid: string;

    constructor(
        public readonly errorCode: string,
        public readonly description: string,
        public readonly data: Map<string, any> = new Map<string, any>()
    ) {
        this.uuid = uuid();
    }

    public set(field: string, value: any): BusinessRuleError<T> {
        this.data.set(field, value);
        return this;
    }

    public raise(): BusinessRuleException {
        return new BusinessRuleException(
            `${this.uuid}`,
            new Date().toLocaleString(),
            `${this.errorCode}`,
            `${this.description}`,
            new Map<string, string>(this.data.entries())
        );
    }
}

import { Dictionary } from "lodash";

export class BusinessRuleException extends Error {
    public readonly id: string;
    public readonly data: Map<string, string> = new Map<string, string>();
    public readonly error: string;
    public readonly errorTime: Date | string;
    public readonly description: string;

    constructor(
        id: string,
        errorTime: Date | string,
        error: string,
        description: string,
        data: Map<string, string>
    ) {
        super(`[${errorTime}] [${id}] [${error}] ${description} - ${data}`);
        Object.setPrototypeOf(this, BusinessRuleException.prototype);

        this.id = id;
        this.data = data;
        this.name = this.constructor.name;
        this.error = error;
        this.stack = new Error().stack;
        this.errorTime = errorTime;
        this.description = description;
    }

    public toJSON(): string {
        const data: Dictionary<any> = {
            id: this.id,
            data: {},
            errorCode: this.error,
            errorTime: this.errorTime,
            description: this.description
        };

        this.data.forEach((value: string, key: string) => {
            data.data[key] = value;
        });

        return JSON.stringify(data);
    }

    public toString(): string {
        return this.toJSON();
    }
}

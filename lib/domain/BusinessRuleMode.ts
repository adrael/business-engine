export enum BusinessRuleMode {
    ANY = "ANY",
    CREATE = "CREATE",
    UPDATE = "UPDATE"
}

export const BUSINESS_RULE_MODE_VALUES: Array<BusinessRuleMode> = [
    BusinessRuleMode.CREATE,
    BusinessRuleMode.UPDATE
];

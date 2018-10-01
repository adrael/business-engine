import { expect } from "chai";
import { List } from "immutable";
import { suite, test } from "mocha-typescript";
import Optional from "typescript-optional";
import { BusinessRule, BusinessRuleHelper, BusinessRuleMode, StringPropertyRequiredRule } from "../../lib";

class FakeClassMock {
    public readonly property: any;

    constructor(value?: any) {
        this.property = value;
    }
}

class NonApplicableRule<T> {
    public isApplicable(data: T): boolean {
        return false;
    }

    public isExecutable(mode: BusinessRuleMode): boolean {
        return true;
    }
}

class NonExecutableRule {
    public isExecutable(mode: BusinessRuleMode): boolean {
        return false;
    }
}

@suite("[UNIT] BusinessRuleHelper")
class BusinessRuleHelperSpec {
    private readonly ruleA = new StringPropertyRequiredRule<FakeClassMock>(BusinessRuleMode.ANY, "property");
    private readonly ruleB = new StringPropertyRequiredRule<FakeClassMock>(BusinessRuleMode.ANY, "property");

    @test
    "should allow checking one business rule at a time"(): void {
        const result = BusinessRuleHelper.checkOne(BusinessRuleMode.CREATE, new FakeClassMock(), this.ruleA);

        expect(result).to.be.instanceof(Optional);
        expect(result.isPresent).to.be.true;
    }

    @test
    "should allow checking several business rules at a time"(): void {
        const result = BusinessRuleHelper.check(BusinessRuleMode.CREATE, new FakeClassMock(), List([ this.ruleA, this.ruleB ]));

        expect(result).to.be.instanceof(Optional);
        expect(result.isPresent).to.be.true;
    }

    @test
    "should failed to check business rules if mode is invalid"(): void {
        const result = () => BusinessRuleHelper.check(<any>null, new FakeClassMock(), List([ this.ruleA, this.ruleB ]));

        expect(result).to.throw();
    }

    @test
    "should failed to check business rules if item is invalid"(): void {
        const result = () => BusinessRuleHelper.check(BusinessRuleMode.CREATE, null, List([ this.ruleA, this.ruleB ]));

        expect(result).to.throw();
    }

    @test
    "should failed to check business rules if rules are invalid"(): void {
        const result = () => BusinessRuleHelper.check(BusinessRuleMode.CREATE, new FakeClassMock(), <any>null);

        expect(result).to.throw();
    }

    @test
    "should ignore non executable rules"(): void {
        const result = BusinessRuleHelper.check(BusinessRuleMode.CREATE, new FakeClassMock(), List([ <BusinessRule<FakeClassMock>>new NonExecutableRule() ]));

        expect(result).to.be.instanceOf(Optional);
        expect(result.isPresent).to.be.false;
    }

    @test
    "should ignore non applicable rules"(): void {
        const result = BusinessRuleHelper.check(BusinessRuleMode.CREATE, new FakeClassMock(), List([ <BusinessRule<FakeClassMock>>new NonApplicableRule<FakeClassMock>() ]));

        expect(result).to.be.instanceOf(Optional);
        expect(result.isPresent).to.be.false;
    }
}

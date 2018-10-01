import { expect } from "chai";
import { suite, test } from "mocha-typescript";
import Optional from "typescript-optional";
import { BusinessRuleMode, BusinessRulesListForItem, StringPropertyRequiredRule } from "../../lib";

class FakeClassMock {
    private readonly property: any;

    constructor(value?: any) {
        this.property = value;
    }
}

class ComplexFakeClassMock {
    public readonly mock: FakeClassMock = new FakeClassMock("test");

    public getMock(): FakeClassMock {
        return this.mock;
    }

    public static getMock(mock: ComplexFakeClassMock): FakeClassMock {
        return mock.getMock();
    }
}

@suite("[UNIT] BusinessRulesListForItem")
class BusinessRulesListForItemSpec {
    private readonly ruleA = new StringPropertyRequiredRule<FakeClassMock>(BusinessRuleMode.ANY, "property");
    private readonly ruleB = new StringPropertyRequiredRule<FakeClassMock>(BusinessRuleMode.ANY, "property");

    @test
    "should accept item accessor as a string"(): void {
        const mock = new ComplexFakeClassMock();
        const ruleList = new BusinessRulesListForItem<ComplexFakeClassMock, FakeClassMock>("mock", this.ruleA);

        const result = ruleList.check(BusinessRuleMode.CREATE, mock);

        expect(ruleList).to.be.instanceOf(BusinessRulesListForItem);
        expect(result).to.be.instanceOf(Optional);
        expect(result.isPresent).to.be.false;
    }

    @test
    "should accept item accessor as a simple function"(): void {
        const mock = new ComplexFakeClassMock();
        const ruleList = new BusinessRulesListForItem<ComplexFakeClassMock, FakeClassMock>(mock.getMock, this.ruleA);

        const result = ruleList.check(BusinessRuleMode.CREATE, mock);

        expect(ruleList).to.be.instanceOf(BusinessRulesListForItem);
        expect(result).to.be.instanceOf(Optional);
        expect(result.isPresent).to.be.false;
    }

    @test
    "should accept item accessor as a static function"(): void {
        const mock = new ComplexFakeClassMock();
        const ruleList = new BusinessRulesListForItem<ComplexFakeClassMock, FakeClassMock>(ComplexFakeClassMock.getMock, this.ruleA);

        const result = ruleList.check(BusinessRuleMode.CREATE, mock);

        expect(ruleList).to.be.instanceOf(BusinessRulesListForItem);
        expect(result).to.be.instanceOf(Optional);
        expect(result.isPresent).to.be.false;
    }

    @test
    "should be applicable by default"(): void {
        const mock = new ComplexFakeClassMock();
        const result = new BusinessRulesListForItem<ComplexFakeClassMock, FakeClassMock>(mock.getMock, this.ruleA);

        expect(result.isApplicable(mock)).to.be.true;
    }

    @test
    "should be executable by default"(): void {
        const result = new BusinessRulesListForItem<ComplexFakeClassMock, FakeClassMock>(ComplexFakeClassMock.getMock, this.ruleA);

        expect(result.isExecutable(BusinessRuleMode.CREATE)).to.be.true;
        expect(result.isExecutable(BusinessRuleMode.UPDATE)).to.be.true;
    }

    @test
    "should throw if item accessor is not a string nor a function"(): void {
        const result = () => new BusinessRulesListForItem<ComplexFakeClassMock, FakeClassMock>(<any>null, this.ruleA);

        expect(result).to.throw();
    }

    @test
    "should accept 0 to Infinite business rules"(): void {
        const result0 = new BusinessRulesListForItem<ComplexFakeClassMock, FakeClassMock>(ComplexFakeClassMock.getMock);
        const result1 = new BusinessRulesListForItem<ComplexFakeClassMock, FakeClassMock>(ComplexFakeClassMock.getMock, <any>null);
        const result2 = new BusinessRulesListForItem<ComplexFakeClassMock, FakeClassMock>(ComplexFakeClassMock.getMock, this.ruleA);
        const result3 = new BusinessRulesListForItem<ComplexFakeClassMock, FakeClassMock>(ComplexFakeClassMock.getMock, this.ruleA, this.ruleB);

        expect(result0).to.be.instanceOf(BusinessRulesListForItem);
        expect(result1).to.be.instanceOf(BusinessRulesListForItem);
        expect(result2).to.be.instanceOf(BusinessRulesListForItem);
        expect(result3).to.be.instanceOf(BusinessRulesListForItem);
    }
}

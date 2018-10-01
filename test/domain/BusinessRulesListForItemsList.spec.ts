import { expect } from "chai";
import { List } from "immutable";
import { suite, test } from "mocha-typescript";
import Optional from "typescript-optional";
import { BusinessRuleMode, BusinessRulesListForItemsList, StringPropertyRequiredRule } from "../../lib";

class FakeClassMock {
    private readonly property: any;

    constructor(value?: any) {
        this.property = value;
    }
}

class ComplexFakeClassMockArray {
    public readonly mocks: Array<FakeClassMock> = [ new FakeClassMock("A"), new FakeClassMock("B") ];

    public getMocks(): Array<FakeClassMock> {
        return this.mocks;
    }

    public static getMocks(mock: ComplexFakeClassMockArray): Array<FakeClassMock> {
        return mock.getMocks();
    }
}

class ComplexFakeClassMockFailingArray {
    public readonly mocks: Array<FakeClassMock> = [ new FakeClassMock(), new FakeClassMock("B") ];

    public getMocks(): Array<FakeClassMock> {
        return this.mocks;
    }

    public static getMocks(mock: ComplexFakeClassMockFailingArray): Array<FakeClassMock> {
        return mock.getMocks();
    }
}

class ComplexFakeClassMockList {
    public readonly mocks: List<FakeClassMock> = List([ new FakeClassMock("A"), new FakeClassMock("B") ]);

    public getMocks(): List<FakeClassMock> {
        return this.mocks;
    }

    public static getMocks(mock: ComplexFakeClassMockList): List<FakeClassMock> {
        return mock.getMocks();
    }
}

@suite("[UNIT] BusinessRulesListForItemsList")
class BusinessRulesListForItemsListSpec {
    private readonly ruleA = new StringPropertyRequiredRule<FakeClassMock>(BusinessRuleMode.ANY, "property");
    private readonly ruleB = new StringPropertyRequiredRule<FakeClassMock>(BusinessRuleMode.ANY, "property");

    @test
    "should accept item accessor as a string"(): void {
        const mock = new ComplexFakeClassMockArray();
        const ruleList = new BusinessRulesListForItemsList<ComplexFakeClassMockArray, FakeClassMock>("mock", this.ruleA);

        const result = ruleList.check(BusinessRuleMode.CREATE, mock);

        expect(ruleList).to.be.instanceOf(BusinessRulesListForItemsList);
        expect(result).to.be.instanceOf(Optional);
        expect(result.isPresent).to.be.false;
    }

    @test
    "should accept item accessor as a simple function"(): void {
        const mock = new ComplexFakeClassMockArray();
        const ruleList = new BusinessRulesListForItemsList<ComplexFakeClassMockArray, FakeClassMock>(mock.getMocks, this.ruleA);

        const result = ruleList.check(BusinessRuleMode.CREATE, mock);

        expect(ruleList).to.be.instanceOf(BusinessRulesListForItemsList);
        expect(result).to.be.instanceOf(Optional);
        expect(result.isPresent).to.be.false;
    }

    @test
    "should accept item accessor as a static function"(): void {
        const mock = new ComplexFakeClassMockArray();
        const ruleList = new BusinessRulesListForItemsList<ComplexFakeClassMockArray, FakeClassMock>(ComplexFakeClassMockArray.getMocks, this.ruleA);

        const result = ruleList.check(BusinessRuleMode.CREATE, mock);

        expect(ruleList).to.be.instanceOf(BusinessRulesListForItemsList);
        expect(result).to.be.instanceOf(Optional);
        expect(result.isPresent).to.be.false;
    }

    @test
    "should work with lists"(): void {
        const mock = new ComplexFakeClassMockList();
        const ruleList = new BusinessRulesListForItemsList<ComplexFakeClassMockList, FakeClassMock>(ComplexFakeClassMockList.getMocks, this.ruleA);

        const result = ruleList.check(BusinessRuleMode.CREATE, mock);

        expect(ruleList).to.be.instanceOf(BusinessRulesListForItemsList);
        expect(result).to.be.instanceOf(Optional);
        expect(result.isPresent).to.be.false;
    }

    @test
    "should fail if any item in iterable fails"(): void {
        const mock = new ComplexFakeClassMockFailingArray();
        const ruleList = new BusinessRulesListForItemsList<ComplexFakeClassMockFailingArray, FakeClassMock>(ComplexFakeClassMockFailingArray.getMocks, this.ruleA);

        const result = ruleList.check(BusinessRuleMode.CREATE, mock);

        expect(ruleList).to.be.instanceOf(BusinessRulesListForItemsList);
        expect(result).to.be.instanceOf(Optional);
        expect(result.isPresent).to.be.true;
    }

    @test
    "should be applicable by default"(): void {
        const mock = new ComplexFakeClassMockArray();
        const result = new BusinessRulesListForItemsList<ComplexFakeClassMockArray, FakeClassMock>(mock.getMocks, this.ruleA);

        expect(result.isApplicable(mock)).to.be.true;
    }

    @test
    "should be executable by default"(): void {
        const result = new BusinessRulesListForItemsList<ComplexFakeClassMockArray, FakeClassMock>(ComplexFakeClassMockArray.getMocks, this.ruleA);

        expect(result.isExecutable(BusinessRuleMode.CREATE)).to.be.true;
        expect(result.isExecutable(BusinessRuleMode.UPDATE)).to.be.true;
    }

    @test
    "should throw if item accessor is not a string nor a function"(): void {
        const result = () => new BusinessRulesListForItemsList<ComplexFakeClassMockArray, FakeClassMock>(<any>null, this.ruleA);

        expect(result).to.throw();
    }

    @test
    "should accept 0 to Infinite business rules"(): void {
        const result0 = new BusinessRulesListForItemsList<ComplexFakeClassMockArray, FakeClassMock>(ComplexFakeClassMockArray.getMocks);
        const result1 = new BusinessRulesListForItemsList<ComplexFakeClassMockArray, FakeClassMock>(ComplexFakeClassMockArray.getMocks, <any>null);
        const result2 = new BusinessRulesListForItemsList<ComplexFakeClassMockArray, FakeClassMock>(ComplexFakeClassMockArray.getMocks, this.ruleA);
        const result3 = new BusinessRulesListForItemsList<ComplexFakeClassMockArray, FakeClassMock>(ComplexFakeClassMockArray.getMocks, this.ruleA, this.ruleB);

        expect(result0).to.be.instanceOf(BusinessRulesListForItemsList);
        expect(result1).to.be.instanceOf(BusinessRulesListForItemsList);
        expect(result2).to.be.instanceOf(BusinessRulesListForItemsList);
        expect(result3).to.be.instanceOf(BusinessRulesListForItemsList);
    }
}

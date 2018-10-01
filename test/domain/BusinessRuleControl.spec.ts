import { expect } from "chai";
import { List } from "immutable";
import { suite, test } from "mocha-typescript";
import { BusinessRuleControl, BusinessRuleMode, IBusinessRule, StringPropertyRequiredRule } from "../../lib";

class FakeClassMock {
    public readonly property: any;

    constructor(value?: any) {
        this.property = value;
    }
}

export class EmptyServiceMock extends BusinessRuleControl<any> {
    public getBusinessRulesMock(): List<IBusinessRule<any>> {
        return this.businessRules;
    }
}

export class FakeServiceMock extends BusinessRuleControl<FakeClassMock> {
    public create(fakeClassMock: FakeClassMock): FakeClassMock {
        this.checkForCreation(fakeClassMock);
        return fakeClassMock;
    }

    public update(fakeClassMock: FakeClassMock): FakeClassMock {
        this.checkForUpdate(fakeClassMock);
        return fakeClassMock;
    }

    public getBusinessRulesMock(): List<IBusinessRule<any>> {
        return this.businessRules;
    }

    protected getBusinessRules(): List<IBusinessRule<FakeClassMock>> {
        return List([ new StringPropertyRequiredRule<FakeClassMock>(BusinessRuleMode.ANY, "property") ]);
    }
}

@suite("[UNIT] BusinessRuleControl")
class BusinessRuleControlSpec {
    @test
    "should initialize with no business rules if not defined"(): void {
        const emptyServiceMock = new EmptyServiceMock();

        const rules: List<IBusinessRule<any>> = emptyServiceMock.getBusinessRulesMock();

        expect(rules).to.be.instanceof(List);
        expect(rules.size).to.deep.equal(0);
    }

    @test
    "should initialize with business rules defined by subclass"(): void {
        const fakeServiceMock = new FakeServiceMock();

        const rules: List<IBusinessRule<FakeClassMock>> = fakeServiceMock.getBusinessRulesMock();

        expect(rules).to.be.instanceof(List);
        expect(rules.size).to.deep.equal(1);
        expect(rules.get(0)).to.be.instanceof(StringPropertyRequiredRule);
    }

    @test
    "should apply owned creation business rules when required to"(): void {
        const fakeServiceMock = new FakeServiceMock();

        const validResult = () => fakeServiceMock.create(new FakeClassMock("Hello"));
        const invalidResult = () => fakeServiceMock.create(new FakeClassMock());

        expect(validResult).not.to.throw();
        expect(invalidResult).to.throw();
    }

    @test
    "should apply owned update business rules when required to"(): void {
        const fakeServiceMock = new FakeServiceMock();

        const validResult = () => fakeServiceMock.update(new FakeClassMock("Hello"));
        const invalidResult = () => fakeServiceMock.update(new FakeClassMock());

        expect(validResult).not.to.throw();
        expect(invalidResult).to.throw();
    }
}

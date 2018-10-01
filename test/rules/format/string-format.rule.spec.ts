import { expect } from "chai";
import { suite, test } from "mocha-typescript";
import Optional from "typescript-optional";
import { BUSINESS_RULE_MODE_VALUES, BusinessRuleError, BusinessRuleMode, StringFormatRule } from "../../../lib";

class FakeClassMock {
    public readonly property: any;

    constructor(value?: any) {
        this.property = value;
    }
}

describe("[UNIT] StringFormatBusinessRule", () => {
    const rule: StringFormatRule<FakeClassMock> = new StringFormatRule<FakeClassMock>(BusinessRuleMode.ANY, "property", "[a-zA-Z0-9]{5}");

    @suite(`Common operations`)
    class StringFormatRuleSpecCommon {
        @test
        "should be applicable if property is set"(): void {
            const mock = new FakeClassMock("OK");

            expect(rule.isApplicable(mock)).to.be.true;
        }

        @test
        "should not be applicable if property is unset"(): void {
            const mock = new FakeClassMock();

            expect(rule.isApplicable(mock)).to.be.false;
        }
    }

    BUSINESS_RULE_MODE_VALUES.forEach((mode: BusinessRuleMode) => {
        @suite(`Specific operations: [${mode}]`)
        class StringFormatRuleSpecSpecific {
            @test
            "should be executable"(): void {
                expect(rule.isExecutable(mode)).to.be.true;
            }

            @test
            "should work successfully if property is not defined"(): void {
                const mock = new FakeClassMock();

                expect(rule.check(mode, mock).isPresent).to.be.false;
            }

            @test
            "should work successfully if property is defined accordingly"(): void {
                const mock = new FakeClassMock("Hello");

                expect(rule.check(mode, mock).isPresent).to.be.false;
            }

            @test
            "should fail if property is wrongly defined"(): void {
                const mock = new FakeClassMock("What a job");

                expect(rule.check(mode, mock).isPresent).to.be.true;
            }

            @test
            "failed check properly indicates failing property"(): void {
                const mock = new FakeClassMock("What a job");
                const optionalError: Optional<BusinessRuleError<FakeClassMock>> = rule.check(mode, mock);

                expect(optionalError.isPresent).to.be.true;

                const error: BusinessRuleError<FakeClassMock> = optionalError.get();
                expect(error.data.get("PROPERTY")).to.deep.equal("property");
            }
        }
    });
});

import { expect } from "chai";
import { suite, test } from "mocha-typescript";
import Optional from "typescript-optional";
import { BUSINESS_RULE_MODE_VALUES, BusinessRule, BusinessRuleError, BusinessRuleMode } from "../../lib";

class FakeBusinessRule extends BusinessRule<any> {
    protected checkForCreation(entity: any): Optional<BusinessRuleError<any>> {
        return Optional.empty();
    }

    protected checkForUpdate(entity: any): Optional<BusinessRuleError<any>> {
        return Optional.empty();
    }
}

describe("[UNIT] BusinessRule", () => {
    @suite("Common operations")
    class BusinessRuleSpec {
        @test
        "should initialize with mode ANY by default"(): void {
            const businessRule = new FakeBusinessRule();

            expect(businessRule).to.be.instanceof(BusinessRule);
            expect(businessRule.getMode()).to.deep.equal(BusinessRuleMode.ANY);
        }

        @test
        "cannot be checked with invalid mode"(): void {
            const businessRule = new FakeBusinessRule(<BusinessRuleMode>"FAKE");

            const result = () => businessRule.validate(3);

            expect(result).to.throw();
        }
    }

    BUSINESS_RULE_MODE_VALUES.forEach((mode: BusinessRuleMode) => {
        @suite(`BusinessRuleMode validation: ${mode}`)
        class BusinessRuleModeSpec {
            private businessRule!: FakeBusinessRule;

            public before(): void {
                this.businessRule = new FakeBusinessRule(mode);
            }

            @test(`can be initialized with mode ${mode}`)
            public modeInitialization(): void {
                expect(this.businessRule).to.be.instanceof(BusinessRule);
                expect(this.businessRule.getMode()).to.deep.equal(mode);
            }

            @test(`can be checked with mode ${mode}`)
            public modeChecking(): void {
                const result = this.businessRule.check(mode, "");

                expect(result).to.be.instanceof(Optional);
                expect(result.isPresent).to.be.false;
            }
        }
    });
});

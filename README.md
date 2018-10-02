# Business Engine

[![npm version][npm-image]][npm-url]
[![Build Status][build-image]][build-url]
[![GitHub issues][github-issues-image]][github-issues-url]
[![Dependencies][dependencies-image]][dependencies-url]
[![Dev Dependencies][dev-image]][dev-url]
[![Peer Dependencies][peer-image]][peer-url]
[![Coverage Status][coverage-image]][coverage-url]
[![Known Vulnerabilities][known-image]][known-url]
[![npm downloads][npm-downloads-image]][npm-downloads-url]
[![GitHub license][github-license-image]][github-license-url]
[![GitHub version][github-version-image]][github-version-url]
[![code style: prettier][prettier-image]][prettier-url]

> Empower your software!

*Business Engine* is a Node.js module allowing you to easily implement your business
rules against your domain. Testable, standalone, opinionated and framework agnostic,
you now have the power to make your code base shiny again.

It can be used on its own, or altogether with some other tools, such as Mongoose.

## Installation

```sh
npm install business-engine --save
```

or

```sh
yarn add business-engine --exact --latest
```

## Usage

Because *Business Engine* is totally DOM free and UI Independent, you can basically do whatever you want with it.
An example would be to check whether a given entity is valid according to predefined business rules.
We could ask the engine to check said entity in a dedicated service, upon creation or update.

Let's do it. We will show how to validate a simple user representation against a few business rules.

Here is what our `User` domain looks like:

```typescript
export class User {
    public email: string;
    public lastName: string;
    public firstName: string;
}
```

Let's review which business rules we would like to apply on this User class.

1 - First name property is mandatory
2 - Email property should match a given email pattern (anything that ends in `@gmail.com`), but only when we create it
2 - Email property should be unique in our database

The first and second rules are quite easy to implement. Actually, there are even rules shipped with *Business Engine* that will do the work for us.
We will use the `StringPropertyRequiredRule` and `StringFormatRule` rules, respectively.

The latter is a bit more complicated. As *Business Engine* is database agnostic, this kind of rules cannot be pre-implemented for us.
We have to do it ourselves. For brevity, we won't show the database logic.
Let's implement the `UniqueUserEmailRule` rule.

```typescript
import { isNil } from "lodash";
import { User } from "../domain/User";
import { BusinessRule, BusinessRuleError } from "business-engine";

// IMPORTANT NOTE
// The entire business engine logic is built around optionals.
import Optional from "typescript-optional";

export class UniqueUserEmailRule<User> extends BusinessRule<User> {

    // This method allows you to implement some kind of routing logic.
    // If the rule applies to your entity, then return true.
    // If not, return false.
    // For example, this can be useful if you only want to target a specific mode
    // no matter what. Or if the rule must only target entities containing specific properties,
    // and so on.
    public isApplicable(user: User): boolean {
        return true;
    }

    protected checkForCreation(user: User): Optional<BusinessRuleError<User>> {
        // ... database logic to check if user's email address is already taken

        if (/* email address already in use */) {
            // When the entity being check is not compliant
            // the engine expects an error to be returned.
            return Optional.ofNonNull(this.buildError(user));
        }

        // When the entity being checked is valid, no error should be risen.
        // Therefore an error-free optional.
        return Optional.empty();
    }

    // In our case, the UPDATE logic is just the same as the CREATE logic
    protected checkForUpdate(user: User): Optional<BusinessRuleError<User>> {
        return this.checkForCreation(user);
    }

    private buildError(user: User): BusinessRuleError<User> {
        return new BusinessRuleError<User>("my-project.errors.email.already.used", "email must be unique")
            .set("EMAIL", user.email);
    }
}

```  

Let's say we have a `UserService` which role is to handle all user interactions, between our resource layer and our repository layer.
It has the duty to make sure our `User` conforms to our rules before making it to the next layer.

```typescript
import { List } from "immutable";
import { User } from "../domain/User";
import { UniqueUserEmailRule } from "../rules/UniqueUserEmailRule";
import { BusinessRuleService, IBusinessRule, BusinessRuleMode, StringPropertyRequiredRule, StringFormatRule } from "business-engine";

export class UserService extends BusinessRuleService {
    // The rules will be applied one after the other, stopping at the first error.
    protected readonly businessRules: List<IBusinessRule<User>> = List(
        // Creating a rule that can be applied in CREATE and UPDATE mode on the firstName property
        new StringPropertyRequiredRule<User>(BusinessRuleMode.ANY, "firstName"),
        
        // Again, CREATE mode only, on email property, with the pattern validator
        new StringFormatRule<User>(BusinessRuleMode.CREATE, "email", /.*@gmail\.com$/i),
        
        // Finally our custom rule
        new UniqueUserEmailRule(BusinessRuleMode.ANY)
    );
    
    public createUser(user: User): User {
        // Will throw an error if user does not comply with our rules
        this.checkForCreation(user);
        
        // ... your logic here
    }
    
    public updateUser(user: User): User {
        // Will throw an error if user does not comply with our rules
        this.checkForUpdate(user);
        
        // ... your logic here
    }
}
```

### Embedded rules

By design, *Business Engine* is shipped with a few handful of useful basic rules.

Here is the list:

- `StringFormatRule`
Checks if a given entity's property comply to a given pattern

- `StringPropertyRequiredRule`
Checks if a given entity's string property if present (e.g. not null, not undefined and not empty) 

- `ObjectPropertyRequiredRule`
Checks if a given entity's property if present (e.g. not null and not undefined) 


## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct,
and the process for submitting pull requests to us.

### Setup

Everything should be available without you installing anything globally.
Just run this command and you are good to go:

```sh
yarn
```

### Running the tests

*Business Engine* uses Mocha and Chai under the hood. Shipped with 100% test coverage.
If you intend to improve the code, or add business rules, your PR is expected to keep the 100% test coverage ratio.

To run the tests, just do:

```sh
npm test
```

or

```sh
yarn test
```

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/Adrael/business-engine/tags). 

## Authors

* **Raphaël MARQUES** - *Initial work* - [Adrael](https://github.com/Adrael)

See also the list of [contributors](https://github.com/Adrael/business-engine/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

[npm-image]: https://badge.fury.io/js/business-engine.svg
[npm-url]: https://badge.fury.io/js/business-engine
[build-image]: https://travis-ci.org/Adrael/business-engine.svg?branch=master
[build-url]: https://travis-ci.org/Adrael/business-engine
[github-issues-image]: https://img.shields.io/github/issues/Adrael/business-engine.svg
[github-issues-url]: https://github.com/Adrael/business-engine/issues
[dependencies-image]: https://david-dm.org/Adrael/business-engine.svg
[dependencies-url]: https://david-dm.org/Adrael/business-engine#info=dependencies
[dev-image]: https://david-dm.org/Adrael/business-engine/dev-status.svg
[dev-url]: https://david-dm.org/Adrael/business-engine#info=devDependencies
[peer-image]: https://david-dm.org/Adrael/business-engine/peer-status.svg
[peer-url]: https://david-dm.org/Adrael/business-engine#info=peerDependenciess
[coverage-image]: https://coveralls.io/repos/github/Adrael/business-engine/badge.svg?branch=master
[coverage-url]: https://coveralls.io/github/Adrael/business-engine?branch=master
[known-image]: https://snyk.io/test/github/Adrael/business-engine/badge.svg
[known-url]: https://snyk.io/test/github/Adrael/business-engine
[npm-downloads-image]: https://img.shields.io/npm/dm/business-engine.svg
[npm-downloads-url]: https://npmjs.org/business-engine
[github-license-image]: https://img.shields.io/github/license/Adrael/business-engine.svg
[github-license-url]: https://github.com/Adrael/business-engine/blob/master/LICENSE
[github-version-url]: https://badge.fury.io/gh/Adrael%2Fbusiness-engine
[github-version-image]: https://badge.fury.io/gh/Adrael%2Fbusiness-engine.svg
[prettier-image]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg
[prettier-url]: https://github.com/prettier/prettier

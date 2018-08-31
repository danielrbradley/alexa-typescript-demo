## Quick Start

Prerequisites:
1. Install the serverless framework and yarn:
    - `npm install -g serverless`
    - `npm install -g yarn`
2. Run `yarn` (or `npm install`) to restore packages

Configure & deploy the skill:
1. Create a file named `.secret.yml` with the following structure:
    ```yml
    vendorId: XXXXXXXXXXXXXX
    skillId: amzn1.ask.skill.xxxx-xxxx-xxxx-xxxx-xxxx
    lambdaArn: arn:aws:lambda:[REGION]:[ACCOUNT_ID]:function:[LAMBDA_ID]
    ```
2. Update the `vendorId` with the one for your account, can be found here: https://developer.amazon.com/mycid.html
3. Run `sls alexa auth` and follow instructions in your browser
4. Run `sls alexa create --name "Guessing Game" --locale en-GB --type custom` to create a new skill
5. Update the `skillId` for the newly created skill (it will be printed in the console).
6. Run `sls deploy` to deploy the lambda
7. Update the `lambdaArn` once the deploy has finished - find the ARN of the lambda in your AWS console.
8. Run `sls alexa update` to deploy the skill manifest.
9. Run `sls alexa build` to deploy the skill interaction model.

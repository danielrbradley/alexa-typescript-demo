## Quick Start

Prerequisites:
1. Install the serverless framework and yarn:
    - `npm install -g serverless`
    - `npm install -g yarn`
2. Run `yarn` (or `npm install`) to restore packages

Deploy the skill:
1. In the `serverless.yml`, set the `custom.alexa.vendorId` - which can be found here: https://developer.amazon.com/mycid.html
2. Run `sls alexa auth` and follow instructions in your browser
3. Create the empty skill: `sls alexa create --name "Guessing Game" --locale en-GB --type custom`
4. Copy the new skill id into the `serverless.yml` properties:
    - `functions.alexa.events.alexaSkill`
    - `custom.alexa.skills.id`
5. Deploy the lambda with `sls deploy`
6. Once the deploy has finished, find the ARN of the lambda and update the `custom.alexa.skills.manifest.apis.custom.endpoint.uri` in the `serverless.yml`.
7. Run `sls alexa update` to deploy the skill manifest.
8. Run `sls alexa build` to deploy the skill interaction model.

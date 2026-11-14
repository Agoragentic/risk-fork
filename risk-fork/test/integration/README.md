# Separately supplied upstream integrations

The standalone core test suite excludes demo and hosted code. To run the demo-only security assertion, set `RISK_FORK_UPSTREAM_CHECKOUT` to an absolute checkout of public upstream commit `7063285e253f92ba18f71470878cef5653a82743` and run `npm run test:integration:demo`. The test verifies the exact security-module SHA-256 before import; It also checks the checkout commit and requires the imported core source and demo module to match HEAD.

To run the hosted-consumer regression, provide the absolute `RISK_FORK_HOSTED_BUNDLE` artifact from the same commit and run `npm run test:integration:hosted`. The test verifies the exact artifact SHA-256 before import. Hosted source and bundles are not included in this candidate. These explicit commands fail if their inputs are unavailable; neither test is counted as a standalone core test. No provider call is needed.

The repository URLs in package metadata target `Agoragentic/risk-fork`. Source availability does not establish an npm package release or replace the exact upstream consumer bindings above.

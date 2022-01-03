# Slack 🔧 Wrench

[![Workflow badge](https://github.com/IBM/slack-wrench/workflows/main/badge.svg?branch=main)](https://github.com/IBM/slack-wrench/actions?query=workflow%3Amain+branch%3Amain)

Tools to help build and test Slack applications.

## Contributing

Our packages are written in Typescript, we use [lerna](https://lerna.js.org/) and [yarn](https://yarnpkg.com) to manage dependencies. You'll need to have [yarn installed](https://yarnpkg.com/docs/install) to develop these packages. Then you can fetch dependencies with:

```bash
yarn install
```

We use [pre-commit](https://pre-commit.com) to share git pre-commit hooks. You'll need to [install it](https://pre-commit.com/#install) and set it up for our repo with:

```bash
pre-commit install
```

## Releasing a New Version

> Note: For maintainers only.

`slack-wrench` uses [Semver](https://semver.org/) for versioning.
Based on the changes since the last release, determine which type of
release this is, `major`, `minor`, or `patch`.

Use lerna to update all of the packages to the new version, and create a pull
request. A GitHub Action will handle publishing to npm once it's merged.

For example, to release a new major version...

```bash
$ git checkout -b release/v1.0.0
$ yarn lerna:version major
$ git push origin release/v1.0.0 --follow-tags

# Open a pull request from `release/v1.0.0` => `main`
```

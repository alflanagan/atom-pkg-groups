# pkg-groups package

[![Build Status](https://travis-ci.org/alflanagan/atom-pkg-groups.svg?branch=master)](https://travis-ci.org/alflanagan/atom-pkg-groups)

This is an [Atom editor](https://atom.io) package to allow you to create groups of packages, and
enable/disable them all at once.

## A Solution to Your Package Population Problem?

Right now my standard setup for Atom includes installing 73 community-supplied extension packages.

Why you might not want all your packages enabled:

1. Resources -- some packages take up a lot of memory and/or CPU when activated,
   by disabling packages you're not using you free that up.
2. Conflicts -- The more packages that are activated, the more likely they are to conflict (use same keys,
   act on the same editors, etc.)

[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard)

![Etch Logo](https://cloud.githubusercontent.com/assets/378023/18806594/927cb104-826c-11e6-8e4b-7b54be52108e.png)

## Setup

Let's define some terms:

### Group

A group is just a list of packages. It exists to let you enable or disable more than one package at once.

### Configuration

A configuration is one or more groups, where each group has a status of "enabled" or "disabled".

### Activation

You define your current setup by selecting configurations for "activation", meaning they enable or disable the packages contained within. Configurations which are not "active" do not have an effect.

## A note on testing

Because of a large backlog of OSX testing resources on the free service [Travis-CI](https://www.travis-ci.org) (see [this issue](https://github.com/travis-ci/travis-ci/issues/7304)), I've disabled testing on OSX. I'll re-enable tests if a) we have a lot of Mac users, or b) start getting error reports from Macs.

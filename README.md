# pkg-groups package

This is an Atom editor package to allow you to create groups of packages, and
enable/disable them all at once.

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

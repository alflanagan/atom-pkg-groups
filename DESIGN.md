# Design Document: PkgGroupsGroup

## Goals
1. Make it as easy as possible to activate or deactivate groups of packages, initially
from a dialog, eventually when project is opened (if config saved).
2. Make it reasonably easy to set up groups of packages. A "group" may be a list of
packages, or a list of other groups.
3. Allow a group to include packages to be deactivated, since some packages conflict.
4. Later: allow user to specify *which* packages conflict with which, auto-determine
packages to disable?
5. If we activate a group and it includes package not installed, offer to install it?

## Model
#### Information
* groups / package lists
* meta groups: groups of groups
* current state of groups: should be one of "activated", "deactivated", or "don't care"

#### Operations
* Determine packages that need to be enabled and disabled to activate or deactivate a group.
* Find packages in a list that are not installed.

## Views


#### Activate/Deactivate Dialog

A dialog to support activating/deactivating groups. This is the primary operation of this package, and the dialog should be small, fast, and focused.
* Should indicate if packages are missing, or if there are conflicts and how they have been resolved.

Lumbermill
=================

Ezpz management of git worktrees

![lumbermill](https://github.com/Rabrennie/lumbermill/assets/9087372/fc48018c-b135-4212-bdea-ee6aaf53c0df)


<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g @rabrennie/lumbermill
$ lm COMMAND
running command...
$ lm (--version)
@rabrennie/lumbermill/0.1.0 darwin-arm64 node-v18.16.0
$ lm --help [COMMAND]
USAGE
  $ lm COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`lm alias delete ALIAS`](#lm-alias-delete-alias)
* [`lm alias list`](#lm-alias-list)
* [`lm alias set ALIAS EXPANSION`](#lm-alias-set-alias-expansion)
* [`lm clone REPO [DIRECTORY]`](#lm-clone-repo-directory)
* [`lm create BRANCH`](#lm-create-branch)
* [`lm remove BRANCH`](#lm-remove-branch)
* [`lm rm BRANCH`](#lm-rm-branch)
* [`lm run SCRIPT`](#lm-run-script)

## `lm alias delete ALIAS`

deletes an alias

```
USAGE
  $ lm alias delete ALIAS

ARGUMENTS
  ALIAS  alias to delete

DESCRIPTION
  deletes an alias

EXAMPLES
  $ lm alias delete
```

_See code: [dist/commands/alias/delete.ts](https://github.com/rabrennie/lumbermill/blob/v0.1.0/dist/commands/alias/delete.ts)_

## `lm alias list`

lists all defined aliases

```
USAGE
  $ lm alias list

DESCRIPTION
  lists all defined aliases

EXAMPLES
  $ lm alias list
```

_See code: [dist/commands/alias/list.ts](https://github.com/rabrennie/lumbermill/blob/v0.1.0/dist/commands/alias/list.ts)_

## `lm alias set ALIAS EXPANSION`

defines a new alias that will expand to a command

```
USAGE
  $ lm alias set ALIAS EXPANSION

ARGUMENTS
  ALIAS      alias to set
  EXPANSION  expansion to set

DESCRIPTION
  defines a new alias that will expand to a command

EXAMPLES
  $ lm alias set
```

_See code: [dist/commands/alias/set.ts](https://github.com/rabrennie/lumbermill/blob/v0.1.0/dist/commands/alias/set.ts)_

## `lm clone REPO [DIRECTORY]`

Clones a repo and configures it for lumbermill

```
USAGE
  $ lm clone REPO [DIRECTORY]

ARGUMENTS
  REPO       repo to clone
  DIRECTORY  target directory

DESCRIPTION
  Clones a repo and configures it for lumbermill

EXAMPLES
  $ lm clone
```

_See code: [dist/commands/clone.ts](https://github.com/rabrennie/lumbermill/blob/v0.1.0/dist/commands/clone.ts)_

## `lm create BRANCH`

Creates a new worktree for a lumbermill managed repo

```
USAGE
  $ lm create BRANCH [--repo <value>]

ARGUMENTS
  BRANCH  branch name to create

FLAGS
  --repo=<value>  repo to use, if not specified, will use repo associated with the current directory

DESCRIPTION
  Creates a new worktree for a lumbermill managed repo

EXAMPLES
  $ lm create
```

_See code: [dist/commands/create.ts](https://github.com/rabrennie/lumbermill/blob/v0.1.0/dist/commands/create.ts)_

## `lm remove BRANCH`

Removes a worktree from a lumbermill managed repo

```
USAGE
  $ lm remove BRANCH [--repo <value>]

ARGUMENTS
  BRANCH  branch name to remove

FLAGS
  --repo=<value>  repo to use, if not specified, will use repo associated with the current directory

DESCRIPTION
  Removes a worktree from a lumbermill managed repo

ALIASES
  $ lm rm

EXAMPLES
  $ lm remove
```

_See code: [dist/commands/remove.ts](https://github.com/rabrennie/lumbermill/blob/v0.1.0/dist/commands/remove.ts)_

## `lm rm BRANCH`

Removes a worktree from a lumbermill managed repo

```
USAGE
  $ lm rm BRANCH [--repo <value>]

ARGUMENTS
  BRANCH  branch name to remove

FLAGS
  --repo=<value>  repo to use, if not specified, will use repo associated with the current directory

DESCRIPTION
  Removes a worktree from a lumbermill managed repo

ALIASES
  $ lm rm

EXAMPLES
  $ lm rm
```

## `lm run SCRIPT`

Runs a script in a worktree

```
USAGE
  $ lm run SCRIPT --branch <value> [--repo <value>]

ARGUMENTS
  SCRIPT  file to read

FLAGS
  --branch=<value>  (required) branch name to run script in
  --repo=<value>    repo to use, if not specified, will use repo associated with the current directory

DESCRIPTION
  Runs a script in a worktree

EXAMPLES
  $ lm run
```

_See code: [dist/commands/run.ts](https://github.com/rabrennie/lumbermill/blob/v0.1.0/dist/commands/run.ts)_
<!-- commandsstop -->

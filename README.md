Lumbermill
=================

Ezpz management of git worktrees

![lumbermill](./docs/images/lumbermill.gif)

<!-- toc -->
* [Usage](#usage)
* [Config Files](#config-files)
* [Repo Config](#repo-config)
* [Commands](#commands)
<!-- tocstop -->
# Usage
```sh-session
$ npm install -g @rabrennie/lumbermill

$ lm clone git@github.com:Rabrennie/lumbermill.git
Creating config file as lumbermill is being run for the first time... done
Cloning into 'main'...

Cloning repo... done
Cloned git@github.com:Rabrennie/lumbermill.git to /development/lumbermill

$ lm create user/ticket-123/testing --repo lumbermill
Created worktree for user/ticket-123/testing in /development/lumbermill/user-ticket-123-testing
Creating worktree... done
...
```

# Config Files

## Main Config
After running the `lm` command it will create a config file in `~/.config/lumbermill/config.json`.
This file keeps track of the repos and aliases managed by Lumbermill using the following format:

```json
{
  "repos": {
    "lumbermill": "/Users/rab/development/lumbermill"
  },
  "aliases": {}
}
```

# Repo Config
After cloning a repo with [`lm clone REPO [DIRECTORY]`](#lm-clone-repo-directory) it will create a `.lumbermill` folder
in the repos directory with a `config.json` file

`.lumbermill/config.json`

```json
{
  "repo": "git@github.com:Rabrennie/lumbermill.git",
  "directory": "/development/lumbermill",
  "defaultBranch": "main",
}
```

It will also create a `scripts` directory where we can store custom scripts

`.lumbermill/scripts/my-cool-script`

```bash
echo "I am running in $(pwd)"
```

```sh-session
$ lm run my-cool-script --repo lumbermill --branch main
I am running in /Users/rab/development/lumbermill/main

$ lm run my-cool-script --repo lumbermill --branch user/ticket-123/testing
I am running in /Users/rab/development/lumbermill/user-ticket-123-testing
```

# Commands
<!-- commands -->
* [`lm alias delete ALIAS`](#lm-alias-delete-alias)
* [`lm alias list`](#lm-alias-list)
* [`lm alias set ALIAS EXPANSION`](#lm-alias-set-alias-expansion)
* [`lm clone REPO [DIRECTORY]`](#lm-clone-repo-directory)
* [`lm create BRANCH`](#lm-create-branch)
* [`lm pull BRANCH`](#lm-pull-branch)
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

_See code: [dist/commands/alias/delete.ts](https://github.com/rabrennie/lumbermill/blob/v0.3.0/dist/commands/alias/delete.ts)_

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

_See code: [dist/commands/alias/list.ts](https://github.com/rabrennie/lumbermill/blob/v0.3.0/dist/commands/alias/list.ts)_

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

_See code: [dist/commands/alias/set.ts](https://github.com/rabrennie/lumbermill/blob/v0.3.0/dist/commands/alias/set.ts)_

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

_See code: [dist/commands/clone.ts](https://github.com/rabrennie/lumbermill/blob/v0.3.0/dist/commands/clone.ts)_

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

_See code: [dist/commands/create.ts](https://github.com/rabrennie/lumbermill/blob/v0.3.0/dist/commands/create.ts)_

## `lm pull BRANCH`

Pulls a remote branch into a worktree

```
USAGE
  $ lm pull BRANCH [--repo <value>]

ARGUMENTS
  BRANCH  branch name to pull

FLAGS
  --repo=<value>  repo to use, if not specified, will use repo associated with the current directory

DESCRIPTION
  Pulls a remote branch into a worktree

EXAMPLES
  $ lm pull
```

_See code: [dist/commands/pull.ts](https://github.com/rabrennie/lumbermill/blob/v0.3.0/dist/commands/pull.ts)_

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

_See code: [dist/commands/remove.ts](https://github.com/rabrennie/lumbermill/blob/v0.3.0/dist/commands/remove.ts)_

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

_See code: [dist/commands/run.ts](https://github.com/rabrennie/lumbermill/blob/v0.3.0/dist/commands/run.ts)_
<!-- commandsstop -->

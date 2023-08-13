oclif-hello-world
=================

oclif example Hello World CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![CircleCI](https://circleci.com/gh/oclif/hello-world/tree/main.svg?style=shield)](https://circleci.com/gh/oclif/hello-world/tree/main)
[![GitHub license](https://img.shields.io/github/license/oclif/hello-world)](https://github.com/oclif/hello-world/blob/main/LICENSE)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g lumbermill
$ lm COMMAND
running command...
$ lm (--version)
lumbermill/0.0.0 darwin-arm64 node-v18.16.0
$ lm --help [COMMAND]
USAGE
  $ lm COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`lm hello PERSON`](#lm-hello-person)
* [`lm hello world`](#lm-hello-world)
* [`lm help [COMMANDS]`](#lm-help-commands)
* [`lm plugins`](#lm-plugins)
* [`lm plugins:install PLUGIN...`](#lm-pluginsinstall-plugin)
* [`lm plugins:inspect PLUGIN...`](#lm-pluginsinspect-plugin)
* [`lm plugins:install PLUGIN...`](#lm-pluginsinstall-plugin-1)
* [`lm plugins:link PLUGIN`](#lm-pluginslink-plugin)
* [`lm plugins:uninstall PLUGIN...`](#lm-pluginsuninstall-plugin)
* [`lm plugins:uninstall PLUGIN...`](#lm-pluginsuninstall-plugin-1)
* [`lm plugins:uninstall PLUGIN...`](#lm-pluginsuninstall-plugin-2)
* [`lm plugins update`](#lm-plugins-update)

## `lm hello PERSON`

Say hello

```
USAGE
  $ lm hello PERSON -f <value>

ARGUMENTS
  PERSON  Person to say hello to

FLAGS
  -f, --from=<value>  (required) Who is saying hello

DESCRIPTION
  Say hello

EXAMPLES
  $ oex hello friend --from oclif
  hello friend from oclif! (./src/commands/hello/index.ts)
```

_See code: [dist/commands/hello/index.ts](https://github.com/rabrennie/lumbermill/lumbermill/blob/v0.0.0/dist/commands/hello/index.ts)_

## `lm hello world`

Say hello world

```
USAGE
  $ lm hello world

DESCRIPTION
  Say hello world

EXAMPLES
  $ lm hello world
  hello world! (./src/commands/hello/world.ts)
```

_See code: [dist/commands/hello/world.ts](https://github.com/rabrennie/lumbermill/lumbermill/blob/v0.0.0/dist/commands/hello/world.ts)_

## `lm help [COMMANDS]`

Display help for lm.

```
USAGE
  $ lm help [COMMANDS] [-n]

ARGUMENTS
  COMMANDS  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for lm.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.2.16/src/commands/help.ts)_

## `lm plugins`

List installed plugins.

```
USAGE
  $ lm plugins [--json] [--core]

FLAGS
  --core  Show core plugins.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ lm plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v3.2.5/src/commands/plugins/index.ts)_

## `lm plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ lm plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.


ALIASES
  $ lm plugins add

EXAMPLES
  $ lm plugins:install myplugin 

  $ lm plugins:install https://github.com/someuser/someplugin

  $ lm plugins:install someuser/someplugin
```

## `lm plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ lm plugins:inspect PLUGIN...

ARGUMENTS
  PLUGIN  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ lm plugins:inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v3.2.5/src/commands/plugins/inspect.ts)_

## `lm plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ lm plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.


ALIASES
  $ lm plugins add

EXAMPLES
  $ lm plugins:install myplugin 

  $ lm plugins:install https://github.com/someuser/someplugin

  $ lm plugins:install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v3.2.5/src/commands/plugins/install.ts)_

## `lm plugins:link PLUGIN`

Links a plugin into the CLI for development.

```
USAGE
  $ lm plugins:link PLUGIN

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Links a plugin into the CLI for development.
  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ lm plugins:link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v3.2.5/src/commands/plugins/link.ts)_

## `lm plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ lm plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ lm plugins unlink
  $ lm plugins remove
```

## `lm plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ lm plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ lm plugins unlink
  $ lm plugins remove
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v3.2.5/src/commands/plugins/uninstall.ts)_

## `lm plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ lm plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ lm plugins unlink
  $ lm plugins remove
```

## `lm plugins update`

Update installed plugins.

```
USAGE
  $ lm plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v3.2.5/src/commands/plugins/update.ts)_
<!-- commandsstop -->

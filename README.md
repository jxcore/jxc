# JXcore-cordova plugin helper

This is a helper module for installing [jxcore-cordova](https://github.com/jxcore/jxcore-cordova) plugin.

# Installation

The best is to install the module globally. This way you may benefit from global `jxc` command.

```bash
$ jx install -g ktrzeciaknubisa/jxc
```

# Usage

Go into your cordova application folder and type:

```bash
$ jxc install
```

This command makes the [jxcore-cordova](https://github.com/jxcore/jxcore-cordova) plugin:

* downloaded
* unpacked
* added to the project

You can also install a plugin from a local package by providing its path explicitly:

```bash
$ jxc install /some/path/io.jxcore.node.jx
```

Type `jxc install --help` form more commands.

# Usage with sample

You may also install the plugin and use a sample from its [sample](https://github.com/jxcore/jxcore-cordova/tree/master/sample) folder:

```bash
$ jxc install --sample express_perf
$ cordova run
```

# Switch sample

Once you have the plugin installed, you may want only to switch the sample:

```bash
$ jxc sample express_perf
```

# Caching downloaded files

## Default caching folder

To prevent multiple downloads of the same jxcore-cordova binary package, you may want to turn on file caching.

```bash
$ jxc config set cache
```

The above command enables cache at default directory, which is `%HOME%/.jxc/cache`.

Beware, this folder may grow big if you install few versions of jxcore-cordova plugin.

From now on, each `jxc install` will check this folder first, prior to downloading.

## Read-only caching folder

Another way of preventing downloads is to use [jxcore-cordova-release](https://github.com/jxcore/jxcore-cordova-release) local repository. Just clone it:

```bash
$ cd /some/folder
$ git clone https://github.com/jxcore/jxcore-cordova-release
```

Now from your cordova application folder set the path once:

```bash
$ jxc config set cache readonly /some/folder/jxcore-cordova-release
```

Type `jxc config --help` form more commands.
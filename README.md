# JXcore-cordova plugin helper

This is a helper module for installing [jxcore-cordova](https://github.com/jxcore/jxcore-cordova) plugin.
Posix and Windows platforms are supported.

# Installation

The best is to install the module globally. This way you may benefit from global `jxc` command.
If you have [JXcore](https://github.com/jxcore/jxcore) installed, you can also use it here:

```bash
$ npm install -g jxc
# or
$ jx install -g jxc
```

# Commands

```bash
$ jxc --help
Usage:
    jxc [command] [options]

Where command:
    config                                         - configuration
    download                                       - downloads jxcore-cordova plugin
    install                                        - downloads and installs jxcore-cordova plugin
    sample                                         - allows to switch the application code

Where options:
    --help                                        - displays this help info
```

**All the commands are briefly explained below.**

You can also check each of them for detailed help:

```bash
$ jxc install --help
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

By default the latest version of the plugin is used. However you may specify an exact version, e.g.:

```bash
$ jxc install 0.0.8
```

For list of other possible versions see http://jxcordova.cloudapp.net.

You can also install a plugin from a local package by providing its path explicitly:

```bash
$ jxc install /some/path/io.jxcore.node.jx
```

# Usage with sample

You may also install the plugin and use a sample from its [sample](https://github.com/jxcore/jxcore-cordova/tree/master/sample) folder:

```bash
$ jxc install --sample express_perf
$ cordova run
```

# Switch sample

Once you have the plugin installed, you may want to only switch the sample:

```bash
$ jxc sample express_perf
```

The list of available samples:

```bash
$ jxc sample list
```

# Download

Downloads (only) the latest version of the plugin, but does not install it into cordova application (thus it may be called from any folder).
This is useful when you want to add the plugin manually to the project (e.g. for Visual Studio solutions).

```bash
$ jxc download
```

By default the latest version of the plugin is used. However you may specify an exact version, e.g.:

```bash
$ jxc install 0.0.8
```

For list of other possible versions see http://jxcordova.cloudapp.net.

# Config

### Caching downloaded files

##### Default caching folder

To prevent multiple downloads of the same jxcore-cordova binary package, you may want to turn on file caching.

```bash
$ jxc config set cache
```

The above command enables cache at default directory, which is `%HOME%/.jxc/cache`.

Beware, this folder may grow big if you install few versions of jxcore-cordova plugin.

From now on, each `jxc install` will check this folder first, prior to downloading.

##### Read-only caching folder

Another way of preventing downloads is to use [jxcore-cordova-release](https://github.com/jxcore/jxcore-cordova-release) local repository. Just clone it:

```bash
$ cd /some/folder
$ git clone https://github.com/jxcore/jxcore-cordova-release
```

Now from your cordova application folder set the path once:

```bash
$ jxc config set cache readonly /some/folder/jxcore-cordova-release
```


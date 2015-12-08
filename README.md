## JXcore-cordova plugin helper

Helper module for installing [jxcore-cordova](https://github.com/jxcore/jxcore-cordova) plugin easily.
Both Posix and Windows platforms are supported.

### Installation

```bash
$ npm install -g jxc
# or
$ jx install -g jxc
```

### Commands

```bash
$ jxc --help
JXcore-cordova helper tool

Usage:
    jxc <command> [options]

Where command:
    config        : configuration
    download      : downloads jxcore-cordova plugin
    install       : downloads and installs jxcore-cordova plugin
    update        : updates jxcore-cordova plugin in cordova project
    sample        : allows to switch the application code

Where options:
    --help        : displays this help info
```

### Usage

Browse into the cordova application folder and type:

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

The list of other possible versions are available under http://az836273.vo.msecnd.net.

You can also install the plugin from a local package by providing its path explicitly:

```bash
$ jxc install /some/path/io.jxcore.node.jx
```

### Usage with sample

You may also install the plugin and use one of our samples from its [sample](https://github.com/jxcore/jxcore-cordova/tree/master/sample) folder:

```bash
$ jxc install --sample express_perf
$ cordova run
```

### Switch to another sample

Once you have the plugin installed, you may want to enable the sample:

```bash
$ jxc sample express_perf
```

**Sample project will overwrite the actual `www` folder!**

In order to get the list of available samples:

```bash
$ jxc sample list
```

### Download

Downloads (only) the latest version of the plugin, but does not install it into 
cordova application (thus it may be called from any folder).

This is useful when you want to add the plugin manually to the project (e.g. for Visual Studio solutions).

```bash
$ jxc download
```

By default the latest version of the plugin is used. However you may specify an exact version, e.g.:

```bash
$ jxc install 0.0.8
```

For list of other possible versions see http://az836273.vo.msecnd.net.

### Update

Updates the jxcore-cordova plugin for cordova application. 
It works pretty much like `install` with `--force` option added:

```bash
$ jxc update
```
or

```bash
$ jxc install --force
```

# Config

#### Caching downloaded files

##### Default caching folder

To prevent multiple downloads of the same jxcore-cordova binary package, you may want to turn on file caching.

```bash
$ jxc config set cache
```

The above command enables cache at default directory, which is `%HOME%/.jxc/cache`.

Beware, this folder may grow big if you install few versions of jxcore-cordova plugin.

From now on, each `jxc install` will check this folder first, prior to downloading.

##### Read-only caching folder

Another way of preventing downloads is to use [jxcore-cordova-release](https://github.com/jxcore/jxcore-cordova-release) 
local repository. Just clone it:

```bash
$ cd /some/folder
$ git clone https://github.com/jxcore/jxcore-cordova-release
```

Now, from the cordova application folder set the path once:

```bash
$ jxc config set cache readonly /some/folder/jxcore-cordova-release
```


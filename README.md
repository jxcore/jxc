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

# Usage with sample

You may also install the plugin and use a sample from its [sample](https://github.com/jxcore/jxcore-cordova/tree/master/sample) folder:

```bash
$ jx install --sample express_perf
$ cordova run
```

# Switch sample

Once you have the plugin installed, you may want only to switch te sample:

```bash
$ jxv sample express_perf
```

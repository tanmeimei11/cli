# in-cli

A simple CLI for scaffolding inprojects.

### Installation

Prerequisites: [Node.js](https://nodejs.org/en/) (>=4.x, 6.x preferred) and [Git](https://git-scm.com/).

``` bash
$ npm install git+ssh://git@githost.in66.cc:in-template/cli.git -g
```

Modify `hosts`
``` vim
10.10.105.88 npm.dot.com
```

``` bash 
$ npm i in-cli -g --registry http://npm.dot.com
```

### Usage

``` bash
$ in-create <project-name> [<template-name>]
```

Example:

``` bash
$ in create my-project
```

上面的命令将 [in-template / vue-multipage](http://githost.in66.cc/in-template/vue-multipage) 模板拉取下来，并生成项目放在在`./my-project/`。

### 官方模版

目前可用的模板包括

- [vue-multipage](http://githost.in66.cc/in-template/vue-multipage) - vuejs 多页面开发模版

### License

[MIT](http://opensource.org/licenses/MIT)

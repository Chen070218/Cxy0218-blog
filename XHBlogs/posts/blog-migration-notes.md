---
title: "把博客从 C 盘搬到 D 盘：一次环境迁移的踩坑记录"
cover: "/screenshots/05-posts.webp"
date: "2026-10-14 21:30:00"
tags: ["Next.js", "环境配置", "踩坑"]
mood: ''
description: "换一台电脑继续跑这个站点，把整个迁移过程和三处坑记下来。"
---

## 为什么要搬

这个站点原来在另一台电脑的 C 盘上跑。这台机器 C 盘吃紧，于是把整个项目挪到 D 盘，同时要在没有 Node 环境的机器上重新把它跑起来。

## 坑一：新机器没有 Node

启动脚本第一句是 `where node`，找不到就直接退出。这次没有装系统级 Node，而是下载官方便携版（v24.21.0 的 win-x64 zip）解压到项目目录里，再在启动脚本里把它加进 PATH：

```bat
if exist "%~dp0node\node.exe" set "PATH=%~dp0node;%PATH%"
```

好处是不需要管理员权限，换机器时把文件夹整个拷过去就能跑，不要了删目录即可。

## 坑二：依赖装到一半断掉

`npm ci` 要从源里拉几百个包，网络一抖就前功尽弃（这次报的是 `ECONNRESET`）。可行的做法是把缓存目录放进项目里（`--cache`），断了重跑时下过的包会直接命中缓存；重跑前不用删 `node_modules`，npm 会自己处理。

## 坑三：服务起来了又自己退出

终端里明明打印了 `Ready`，过一会儿进程却没了。报错是 `EXDEV: cross-device link not permitted`，出在 Next 写遥测配置文件那一步。把遥测关掉就正常了：

```bat
set "NEXT_TELEMETRY_DISABLED=1"
```

## 小结

迁移的要点其实就两条：环境尽量做成便携的（放进项目目录），以及把启动脚本里"依赖外部环境"的地方提前兜住——少一个假设，就少一个换机器时要重新排查的坑。
## 迁移后顺手修的几个问题

环境跑起来之后还处理了几处「不修不行」的细节：

```bat
:: 启动脚本：优先使用随包内置的 Node，并关掉遥测
if exist "%~dp0node\node.exe" set "PATH=%~dp0node;%PATH%"
set "NEXT_TELEMETRY_DISABLED=1"
```

- 本机没有系统级 Node，脚本第一句 `where node` 就会失败退出 —— 改为优先用项目自带的便携版 Node；
- 不加 `NEXT_TELEMETRY_DISABLED=1` 时，Next 16 写遥测配置会抛 `EXDEV` 并让进程退出；
- 顺带把「内容必须等 JS 才显示」的规则删掉，手机慢网下不再长时间白屏；
- 图片全部走 WebP 按尺寸下发，并把三张 900KB 级别的图压到几十 KB。

![写完并整理后的文章列表](/screenshots/05-posts.webp)

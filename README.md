[![StepSecurity Maintained Action](https://raw.githubusercontent.com/step-security/maintained-actions-assets/main/assets/maintained-action-banner.png)](https://docs.stepsecurity.io/actions/stepsecurity-maintained-actions)

[![GitHub release](https://img.shields.io/github/release/step-security/setup-qemu-action.svg?style=flat-square)](https://github.com/step-security/setup-qemu-action/releases/latest)
[![CI workflow](https://img.shields.io/github/actions/workflow/status/step-security/setup-qemu-action/ci.yml?branch=master&label=ci&logo=github&style=flat-square)](https://github.com/step-security/setup-qemu-action/actions?workflow=ci)
[![Test workflow](https://img.shields.io/github/actions/workflow/status/step-security/setup-qemu-action/test.yml?branch=master&label=test&logo=github&style=flat-square)](https://github.com/step-security/setup-qemu-action/actions?workflow=test)

## About

GitHub Action to install [QEMU](https://github.com/qemu/qemu) static binaries.

![Screenshot](.github/setup-qemu-action.png)

___

* [Usage](#usage)
* [Customizing](#customizing)
  * [inputs](#inputs)
  * [outputs](#outputs)
* [Contributing](#contributing)

## Usage

```yaml
name: ci

on:
  push:

jobs:
  qemu:
    runs-on: ubuntu-latest
    steps:
      -
        name: Set up QEMU
        uses: step-security/setup-qemu-action@v3
```

This action registers QEMU emulators with `binfmt_misc`, so later steps can run
containers built for another architecture on the GitHub-hosted runner.

```yaml
name: run-cross-platform-container

on:
  workflow_dispatch:

jobs:
  qemu-example:
    runs-on: ubuntu-latest
    steps:
      -
        name: Set up QEMU
        uses: docker/setup-qemu-action@v4
      -
        name: Run an arm64 container
        run: docker run --rm --platform linux/arm64 alpine uname -m
```

The command above prints `aarch64` even though the job itself is running on
`ubuntu-latest`.

> [!TIP]
> `setup-qemu-action` enables user-mode emulation for registered platforms. It
> does not install `qemu-system-*` tools or add `qemu-*` binaries to your PATH.

> [!NOTE]
> If you are using [`step-security/setup-buildx-action`](https://github.com/step-security/setup-buildx-action),
> this action should come before it:
> 
> ```yaml
>     -
>       name: Set up QEMU
>       uses: step-security/setup-qemu-action@v3
>     -
>       name: Set up Docker Buildx
>       uses: step-security/setup-buildx-action@v3
> ```

## Customizing

### inputs

The following inputs can be used as `step.with` keys:

| Name          | Type   | Default                                                                       | Description                                        |
|---------------|--------|-------------------------------------------------------------------------------|----------------------------------------------------|
| `image`       | String | [`tonistiigi/binfmt:latest`](https://hub.docker.com/r/tonistiigi/binfmt/tags) | QEMU static binaries Docker image                  |
| `platforms`   | String | `all`                                                                         | Platforms to install (e.g., `arm64,riscv64,arm`)   |
| `reset`       | Bool   | `false`                                                                       | Uninstall current emulators before installation    |
| `cache-image` | Bool   | `true`                                                                        | Cache binfmt image to GitHub Actions cache backend |

### outputs

The following outputs are available:

| Name          | Type    | Description                           |
|---------------|---------|---------------------------------------|
| `platforms`   | String  | Available platforms (comma separated) |

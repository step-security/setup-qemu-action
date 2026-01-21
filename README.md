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
| `cache-image` | Bool   | `true`                                                                        | Cache binfmt image to GitHub Actions cache backend |

### outputs

The following outputs are available:

| Name          | Type    | Description                           |
|---------------|---------|---------------------------------------|
| `platforms`   | String  | Available platforms (comma separated) |

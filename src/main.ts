import * as core from '@actions/core';
import * as actionsToolkit from '@docker/actions-toolkit';
import axios, {isAxiosError} from 'axios';
import * as fs from 'fs';

import {Docker} from '@docker/actions-toolkit/lib/docker/docker.js';

import * as context from './context.js';

interface Platforms {
  supported: string[];
  available: string[];
}

async function validateSubscription(): Promise<void> {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  let repoPrivate: boolean | undefined;

  if (eventPath && fs.existsSync(eventPath)) {
    const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
    repoPrivate = eventData?.repository?.private;
  }

  const upstream = 'docker/setup-qemu-action';
  const action = process.env.GITHUB_ACTION_REPOSITORY;
  const docsUrl = 'https://docs.stepsecurity.io/actions/stepsecurity-maintained-actions';

  core.info('');
  core.info('\u001b[1;36mStepSecurity Maintained Action\u001b[0m');
  core.info(`Secure drop-in replacement for ${upstream}`);
  if (repoPrivate === false) core.info('\u001b[32m\u2713 Free for public repositories\u001b[0m');
  core.info(`\u001b[36mLearn more:\u001b[0m ${docsUrl}`);
  core.info('');

  if (repoPrivate === false) return;

  const serverUrl = process.env.GITHUB_SERVER_URL || 'https://github.com';
  const body: Record<string, string> = {action: action || ''};
  if (serverUrl !== 'https://github.com') body.ghes_server = serverUrl;
  try {
    await axios.post(
      `https://agent.api.stepsecurity.io/v1/github/${process.env.GITHUB_REPOSITORY}/actions/maintained-actions-subscription`,
      body,
      {timeout: 3000}
    );
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 403) {
      core.error(`\u001b[1;31mThis action requires a StepSecurity subscription for private repositories.\u001b[0m`);
      core.error(`\u001b[31mLearn how to enable a subscription: ${docsUrl}\u001b[0m`);
      process.exit(1);
    }
    core.info('Timeout or API not reachable. Continuing to next step.');
  }
}

actionsToolkit.run(
  // main
  async () => {
    await validateSubscription();
    const input: context.Inputs = context.getInputs();

    await core.group(`Docker info`, async () => {
      await Docker.printVersion();
      await Docker.printInfo();
    });

    await core.group(`Pulling binfmt Docker image`, async () => {
      await Docker.pull(input.image, input.cacheImage);
    });

    await core.group(`Image info`, async () => {
      await Docker.getExecOutput(['image', 'inspect', input.image], {
        ignoreReturnCode: true
      }).then(res => {
        if (res.stderr.length > 0 && res.exitCode != 0) {
          throw new Error(res.stderr.match(/(.*)\s*$/)?.[0]?.trim() ?? 'unknown error');
        }
      });
    });

    await core.group(`Binfmt version`, async () => {
      await Docker.getExecOutput(['run', '--rm', '--privileged', input.image, '--version'], {
        ignoreReturnCode: true
      }).then(res => {
        if (res.stderr.length > 0 && res.exitCode != 0) {
          throw new Error(res.stderr.match(/(.*)\s*$/)?.[0]?.trim() ?? 'unknown error');
        }
      });
    });

    if (input.reset) {
      await core.group(`Uninstalling current emulators`, async () => {
        await Docker.getExecOutput(['run', '--rm', '--privileged', input.image, '--uninstall', 'qemu-*'], {
          ignoreReturnCode: true
        }).then(res => {
          if (res.stderr.length > 0 && res.exitCode != 0) {
            throw new Error(res.stderr.match(/(.*)\s*$/)?.[0]?.trim() ?? 'unknown error');
          }
        });
      });
    }

    await core.group(`Installing QEMU static binaries`, async () => {
      await Docker.getExecOutput(['run', '--rm', '--privileged', input.image, '--install', input.platforms], {
        ignoreReturnCode: true
      }).then(res => {
        if (res.stderr.length > 0 && res.exitCode != 0) {
          throw new Error(res.stderr.match(/(.*)\s*$/)?.[0]?.trim() ?? 'unknown error');
        }
      });
    });

    await core.group(`Extracting available platforms`, async () => {
      await Docker.getExecOutput(['run', '--rm', '--privileged', input.image], {
        ignoreReturnCode: true,
        silent: true
      }).then(res => {
        if (res.stderr.length > 0 && res.exitCode != 0) {
          throw new Error(res.stderr.match(/(.*)\s*$/)?.[0]?.trim() ?? 'unknown error');
        }
        const platforms: Platforms = JSON.parse(res.stdout.trim());
        core.info(`${platforms.supported.join(',')}`);
        core.setOutput('platforms', platforms.supported.join(','));
      });
    });
  }
);

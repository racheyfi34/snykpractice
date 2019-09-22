import * as modulesParser from './npm-modules-parser';
import * as lockParser from './npm-lock-parser';
import * as types from '../types';
import { MissingTargetFileError } from '../../errors/missing-targetfile-error';
import { legacyPlugin as pluginApi } from '@snyk/cli-interface';

export async function inspect(root: string, targetFile: string, options: types.Options = {}):
Promise<pluginApi.MultiProjectResult> {
  if (!targetFile ) {
    throw MissingTargetFileError(root);
  }
  const isLockFileBased = (targetFile.endsWith('package-lock.json') || targetFile.endsWith('yarn.lock'));

  const getLockFileDeps = isLockFileBased && !options.traverseNodeModules;
  const depTree: any = getLockFileDeps ?
      await lockParser.parse(root, targetFile, options) :
      await modulesParser.parse(root, targetFile, options);

  return {
    plugin: {
      name: 'snyk-nodejs-lockfile-parser',
      runtime: process.version,
    },
    scannedProjects: [{depTree}],
  };
}

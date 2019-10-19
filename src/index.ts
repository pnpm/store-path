import canLink = require('can-link')
import makeDir = require('make-dir')
import fs = require('mz/fs')
import os = require('os')
import path = require('path')
import pathAbsolute = require('path-absolute')
import pathTemp = require('path-temp')
import rootLinkTarget = require('root-link-target')
import touch = require('touch')

const STORE_VERSION = '2'

export default async function (
  pkgRoot: string,
  storePath?: string,
) {
  if (!storePath || isHomepath(storePath)) {
    const relStorePath = storePath ? storePath.substr(2) : '.pnpm-store'
    return await storePathRelativeToHome(pkgRoot, relStorePath)
  }

  const storeBasePath = pathAbsolute(storePath, pkgRoot)

  if (storeBasePath.endsWith(`${path.sep}${STORE_VERSION}`)) {
    return storeBasePath
  }
  return path.join(storeBasePath, STORE_VERSION)
}

async function storePathRelativeToHome (pkgRoot: string, relStore: string) {
  const tempFile = pathTemp(pkgRoot)
  await makeDir(path.dirname(tempFile))
  await touch(tempFile)
  const homedir = getHomedir()
  if (await canLink(tempFile, pathTemp(homedir))) {
    await fs.unlink(tempFile)
    // If the project is on the drive on which the OS home directory
    // then the store is placed in the home directory
    return path.join(homedir, relStore, STORE_VERSION)
  }
  try {
    let mountpoint = await rootLinkTarget(tempFile)
    // Usually, it is dissallowed to write files into the drive's root.
    // So we create an empty directory and try to link there.
    // The store will be a directory anyway.
    const mountpointParent = path.join(mountpoint, '..')
    if (!dirsAreEqual(mountpointParent, mountpoint) && await canLinkToSubdir(tempFile, mountpointParent)) {
      mountpoint = mountpointParent
    }
    // If linking works only in the project folder
    // then prefer to place the store inside the homedir
    if (dirsAreEqual(pkgRoot, mountpoint)) {
      return path.join(homedir, relStore, STORE_VERSION)
    }
    return path.join(mountpoint, relStore, STORE_VERSION)
  } catch (err) {
    // this is an unlikely situation but if there is no way to find
    // a linkable place on the disk, create the store in homedir
    return path.join(homedir, relStore, STORE_VERSION)
  } finally {
    await fs.unlink(tempFile)
  }
}

async function canLinkToSubdir (fileToLink: string, dir: string) {
  let result = false
  try {
    const tmpDir = pathTemp(dir)
    await makeDir(tmpDir)
    result = await canLink(fileToLink, pathTemp(tmpDir))
    await fs.rmdir(tmpDir)
  } catch (err) {
    return false
  }
  return result
}

function dirsAreEqual (dir1: string, dir2: string) {
  return path.relative(dir1, dir2) === '.'
}

function getHomedir () {
  const home = os.homedir()
  if (!home) throw new Error('Could not find the homedir')
  return home
}

function isHomepath (filepath: string) {
  return filepath.indexOf('~/') === 0 || filepath.indexOf('~\\') === 0
}

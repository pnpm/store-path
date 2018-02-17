import canLink = require('can-link')
import osHomedir = require('os-homedir')
import path = require('path')
import pathAbsolute = require('path-absolute')
import touch = require('touch')
import pathTemp = require('path-temp')
import fs = require('mz/fs')
import rootLinkTarget = require('root-link-target')

const STORE_VERSION = '2'
const STORE_DEFAULT_PATH = '~/.pnpm-store'

export default async function (
  storePath: string | undefined,
  pkgRoot: string,
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
  await touch(tempFile)
  const homedir = getHomedir()
  if (await canLink(tempFile, path.join(homedir, path.basename(tempFile)))) {
    await fs.unlink(tempFile)
    // If the project is on the drive on which the OS home directory
    // then the store is placed in the home directory
    return path.join(homedir, relStore, STORE_VERSION)
  }
  try {
    const mountpoint = await rootLinkTarget(tempFile)
    return path.join(mountpoint, relStore, STORE_VERSION)
  } catch (err) {
    // this is an unlikely situation but if there is no way to find
    // a linkable place on the disk, create the store in homedir
    return path.join(homedir, relStore, STORE_VERSION)
  } finally {
    await fs.unlink(tempFile)
  }
}

function getHomedir () {
  const home = osHomedir()
  if (!home) throw new Error('Could not find the homedir')
  return home
}

function isHomepath (filepath: string) {
  return filepath.indexOf('~/') === 0 || filepath.indexOf('~\\') === 0
}
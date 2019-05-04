import storePath from '@pnpm/store-path'
import path = require('path')
import rimraf = require('rimraf')
import test = require('tape')

const temp = path.join(__dirname, 'temp')
rimraf.sync(temp)

test('storePath()', async (t) => {
  t.ok(await storePath(process.cwd()))
  t.ok(await storePath(path.join(temp, 'subdir')), 'works with dir that does not exist yet')
  t.end()
})

test('storePath() does not fail when pkgRoot is $HOME', async (t) => {
  t.ok(await storePath(process.env.HOME as string))
  t.end()
})

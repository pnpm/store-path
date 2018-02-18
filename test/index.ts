import test = require('tape')
import storePath from '@pnpm/store-path'
import rimraf = require('rimraf')
import path = require('path')

const temp = path.join(__dirname, 'temp')
rimraf.sync(temp)

test('storePath()', async (t) => {
  t.ok(await storePath(process.cwd()))
  t.ok(await storePath(path.join(temp, 'subdir')), 'works with dir that does not exist yet')
  t.end()
})

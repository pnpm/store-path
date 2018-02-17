import test = require('tape')
import storePath from '@pnpm/store-path'

test('storePath()', async (t) => {
  t.ok(storePath(undefined, process.cwd()))
  t.end()
})

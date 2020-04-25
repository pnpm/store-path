jest.mock('os')
import storePath from '../src'

test('when a link can be created to the homedir', async () => {
  expect(await storePath('/can-link-to-homedir')).toBe('/home/user/.pnpm-store/v3')
})

test('a link can be created to the root of the drive', async () => {
  expect(await storePath('/src/workspace/project')).toBe('/.pnpm-store/v3')
})

test('a link can be created to the a subdir in the root of the drive', async () => {
  expect(await storePath('/mnt/project')).toBe('/mnt/.pnpm-store/v3')
})

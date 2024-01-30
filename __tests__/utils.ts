import fs from 'fs'

export const compareTwoFiles = (
  filePath1: string,
  filePath2: string
): boolean => {
  return fs.readFileSync(filePath1).equals(fs.readFileSync(filePath2))
}

export const testWithFiles = async (
  files: { from: string; to: string }[],
  runTest: (filesPaths: string[]) => Promise<void>
): Promise<void> => {
  for (const { from, to } of files) {
    fs.copyFileSync(from, to)
  }

  await runTest(files.reduce((acc, { to }) => [...acc, to], [] as string[]))

  for (const { to } of files) {
    if (fs.existsSync(to)) {
      fs.unlinkSync(to)
    }
  }
}

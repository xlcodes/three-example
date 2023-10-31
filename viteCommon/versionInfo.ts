import shell from "shelljs"
import dayjs from "dayjs";

const DATE_FORMAT_STR = "YYYY-MM-DD HH:mm:ss"

const exec = command => shell.exec(command, {
  silent: true,
}).stdout

const VersionInfo = {
  // 获取 commitID 前7位信息
  commitId: exec('git rev-parse --short HEAD'),
  // 获取完整的 commitID
  shortCommitId: exec('git rev-parse HEAD'),
  // 获取当前分支名称
  branchName: exec('git branch --show-current'),
  // 获取打包日期
  time: dayjs(new Date()).format(DATE_FORMAT_STR),
}

// 去除信息行尾的 /n 换行字符
Object.keys(VersionInfo).forEach(k => {
  const val = VersionInfo[k]
  VersionInfo[k] = typeof val === 'string' ? val.trim().replace(/\n$/, '') : val
})

export default VersionInfo

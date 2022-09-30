const fs = require('fs')
const path = require('path')
const { sJson, UUID, sHash } = require('./utils/string')

const CONFIG_Port = {     // 此处修改对应端口无效
  proxy: 8001,    // anyproxy 代理端口
  webif: 8002,    // 网络请求查看端口
  webst: 65530       // webUI 主页面端口
}

const CONFIG = {
  path: path.join(__dirname, 'script', 'Lists', 'config.json'),
}

if (fs.existsSync(CONFIG.path)) {
  Object.assign(CONFIG, sJson(fs.readFileSync(CONFIG.path, "utf8")))
}

//CONFIG_Port.webst = process.env.PORT || CONFIG.webUI?.port || CONFIG_Port.webst;

if (CONFIG.anyproxy) {
  if (CONFIG.anyproxy.port) {
    CONFIG_Port.proxy = CONFIG.anyproxy.port
  } else {
    CONFIG.anyproxy.port = CONFIG_Port.proxy
  }
  if (CONFIG.anyproxy.webPort) {
    CONFIG_Port.webif = CONFIG.anyproxy.webPort
  } else {
    CONFIG.anyproxy.webPort = CONFIG_Port.webif
  }
} else {
  CONFIG.anyproxy = {
    enable: false,
    port: CONFIG_Port.proxy,
    webPort: CONFIG_Port.webif
  }
}

if (process.env.TOKEN) {
  CONFIG.wbrtoken = process.env.TOKEN.trim()
  delete process.env.TOKEN
}
if (!CONFIG.wbrtoken) {
  CONFIG.wbrtoken = UUID()
}
if (!CONFIG.env) {
  CONFIG.env = {
    path: ''
  }
} else {
  const { path, PATH, ...config_other } = CONFIG.env
  for (let enkey in config_other) {
    process.env[enkey] = config_other[enkey]
  }
}
if (!CONFIG.SECURITY) {
  CONFIG.SECURITY = {
    enable: false,
  }
}
process.env.PATH = [...new Set([
  ...process.env.PATH.split(path.delimiter),
  ...(CONFIG.env.path ?? CONFIG.env.PATH ?? '').split(path.delimiter),
  path.join(__dirname, 'script/Shell')
].filter(s=>s))].join(path.delimiter)
CONFIG.env.path = process.env.PATH

CONFIG.userid  = sHash(CONFIG.wbrtoken)
CONFIG.version = require('./package.json').version
CONFIG.vernum  = Number(CONFIG.version.replace(/\.|v/g, ''))
CONFIG.start   = Date.now()

module.exports = { CONFIG, CONFIG_Port }

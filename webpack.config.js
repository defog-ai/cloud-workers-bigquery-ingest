module.exports = {
  target: "webworker",
  entry: "./src/index.js",
  output: {
    filename: 'worker.js',
  },
  node: {
    fs: 'empty',
    tls: 'empty',
    net: 'empty',
    child_process: 'empty'
  }
}
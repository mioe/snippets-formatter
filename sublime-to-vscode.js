const fs = require('fs')

const IMPORT_FOLDER = './snippets/'
const FORMAT = new RegExp('\\.sublime-snippet', 'i')
let result = {}

function cutString(str, start, end) {
  const indexA = str.indexOf(start) + start.length
  const indexB = str.indexOf(end)
  return str.substring(indexA, indexB)
}

function strToArray(str) {
  const arr = str.split('\n')
  return arr.filter(line => line.length > 0)
}

function templateVscodeSnippet(name, prefix, body) {
  let tmp = {}
  tmp[name] = {
    prefix: prefix,
    body: strToArray(body),
    description: name,
  }
  return tmp
}

function writeFile(data) {
  fs.writeFile('snippets.json', JSON.stringify(data, null, '\t'), 'utf8', (err) => {
    if (err) throw err
    console.log('The file has been saved!')
  })
}


fs.readdir(IMPORT_FOLDER, (err, files) => {
  if (err != null) return console.error('ERROR:', err)

  const snippets = files.filter(file => file.match(FORMAT))
  snippets.forEach(snippet => {
    fs.readFile(`${IMPORT_FOLDER}/${snippet}`, { encoding: 'utf-8' }, function (err, data) {
      if (err) {
        if (err.code == 'ENOENT') console.error(err.message)
        else console.error(err)
      } else {
        const name = snippet.replace(FORMAT, '')
        const tag = cutString(data, '<tabTrigger>', '</tabTrigger>')
        const body = cutString(data, '<content><![CDATA[', ']]></content>')
        const snippet_result = templateVscodeSnippet(name, tag, body)
        result = {...result, ...snippet_result}
      }
    })
  })
})

setTimeout(() => {
  writeFile(result)
}, 1000);


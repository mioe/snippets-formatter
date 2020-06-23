const fs = require('fs')
const { promisify } = require('util')

const readdirAsync = promisify(fs.readdir)
const readFileAsync = promisify(fs.readFile)
const writeFileAsync = promisify(fs.writeFile)

const IMPORT_FOLDER = './snippets/'
const FORMAT = new RegExp('\\.sublime-snippet', 'i')

const cutString = (str, start, end) => {
  const indexA = str.indexOf(start) + start.length
  const indexB = str.indexOf(end)
  return str.substring(indexA, indexB)
}

const strToArray = str => {
  const arr = str.split('\n')
  return arr.filter(line => line.length > 0)
}
const templateVscodeSnippet = (name, prefix, body) => {
  let tmp = {}
  tmp[name] = {
    prefix: prefix,
    body: strToArray(body),
    description: name,
  }
  return tmp
}

const writeFile = async (data) => {
  try {
    await writeFileAsync('snippets.json', JSON.stringify(data, null, '\t'), 'utf8')
  } catch (err) {
    console.log(err)
  }
}


const main = async () => {
  try {
    const files = await readdirAsync(IMPORT_FOLDER)
    const snippets = files.filter(file => file.match(FORMAT))
    const promise = snippets.map(async (snippet) => await readFileAsync(`${IMPORT_FOLDER}/${snippet}`, { encoding: 'utf-8' }))
    const data = await Promise.all(promise)
    return data.map((snippet, index) => {
      const name = snippets[index].replace(FORMAT, '')
      const tag = cutString(snippet, '<tabTrigger>', '</tabTrigger>')
      const body = cutString(snippet, '<content><![CDATA[', ']]></content>')
      return templateVscodeSnippet(name, tag, body)
    })
  } catch (err) {
    console.log(err)
  }
}

(async () => {
  const data = await main()
  let result = {}
  data.forEach(el => { result = {...result, ...el} })
  await writeFile(result)
  console.log('END')
})()

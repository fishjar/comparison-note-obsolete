const fs = require('fs');
const fse = require('fs-extra');
const marked = require('marked');


const outlines = [];


// 获取所有文件标题
fs.readdirSync('./src')
  .filter(file => file.endsWith('.md'))
  .forEach(file => {
    console.log(file);

    const fileInfo = {
      file,
      titles: []
    };

    const renderer = new marked.Renderer();
    renderer.heading = function (text, level) {
      fileInfo.titles.push({ text, level });
      return `<h${level} id="${text}">${text}</h${level}>`;
    };

    const data = fs.readFileSync(`./src/${file}`, 'utf8');
    const htmlBody = marked(data, { renderer });
    const htmlNav = marked(fileInfo.titles.map(title => `${'  '.repeat(title.level - 1)}- [${title.text}](#${title.text})`).join('\n'));

    const html = `<!doctype html>
      <html>
      <head>
        <meta charset="utf-8"/>
        <title>${file}</title>
      </head>
      <body>
        <div id="nav">
          ${htmlNav}
        </div>
        <div id="content">
          ${htmlBody}
        </div>
      </body>
      </html>`;
    fs.writeFileSync(`./dist/${file.slice(0, -3)}.html`, html);

    outlines.push(fileInfo);
  });
// console.log(outlines);


/**
 * 生成index.html
 */
const indexLines = [];
outlines.forEach(item => {
  item.titles.forEach((title, index) => {
    if (index === 0) {
      indexLines.push(`- [${item.file.slice(0, -3)}](./${encodeURIComponent(item.file)})`);
    } else {
      indexLines.push(`${'  '.repeat(title.level - 1)}- [${title.text}](./${encodeURIComponent(item.file)}#${encodeURIComponent(title.text)})`);
    }
  })
});
const indexStr = `<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>programming-language-comparison</title>
</head>
<body>
  <div id="nav">
    ${marked(indexLines.join('\n'))}
  </div>
</body>
</html>
`;
// console.log(readmeStr)
fs.writeFileSync('./dist/index.html', indexStr);


/**
 * 生成README.md
 */
const readmeLines = [];
outlines.forEach(item => {
  item.titles.forEach((title, index) => {
    if (index === 0) {
      readmeLines.push(`- [${item.file.slice(0, -3)}](./src/${encodeURIComponent(item.file)})`);
    } else {
      readmeLines.push(`${'  '.repeat(title.level - 1)}- [${title.text}](./src/${encodeURIComponent(item.file)}#${encodeURIComponent(title.text)})`);
    }
  })
});
const readmeStr = `
# 编程语言 对比学习/速查

${readmeLines.join('\n')}

![编程语言学习大纲](./src/images/language.png)
`;
// console.log(readmeStr)
fs.writeFileSync('./README.md', readmeStr);


/**
 * 生成outlines.txt
 */
const languageLines = ['language'];
outlines.forEach(item => {
  item.titles.forEach((title, index) => {
    if (index === 0) {
      languageLines.push(`${'\t'.repeat(title.level)}${item.file.slice(0, -3)}`);
    } else {
      languageLines.push(`${'\t'.repeat(title.level)}${title.text}`);
    }
  })
});
const languageStr = languageLines.join('\n');
// console.log(languageStr)
fs.writeFileSync('./outlines.txt', languageStr);


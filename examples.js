'use strict'

const html2json = require('./src/html2json').html2json

let html = `<p>I mistakenly added files to Git using the command:</p>
    <pre><code>git add myfile.txt</code></pre><p>I have not yet run <code>git commit</code>.
     Is there a way to undo this, so these files won't be included in the commit?</p>`

console.info(html2json(html))
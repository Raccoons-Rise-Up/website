import * as fs from 'fs/promises'
import * as path from 'path'

const publicPath = path.join(`${path.resolve()}/public`)
const fileList = await fs.readdir(publicPath, {withFileTypes: true})

for(const file of fileList){
    if(!file.isFile() || !file.name.match(/\.html$/)){
        continue
    }
    const filePath = path.join(`${publicPath}/${file.name}`)
    const htmlStr = await fs.readFile(filePath, {encoding: 'utf-8'})
    const unminifiedStr = htmlStr.replace(/min\//, 'script/')
    await fs.writeFile(filePath, unminifiedStr)
}

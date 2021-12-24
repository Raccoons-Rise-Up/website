import { minify } from "terser"
import * as fs from "fs/promises"
import * as path from "path"

//* script to minify
const scriptPath = path.join(`${path.resolve()}/public/script`)
const files = await fs.readdir(scriptPath, {withFileTypes: true})
for(const file of files){
    if(file.isFile() || !file.name.match(/\.html$/)){
        const filePath = path.join(`${scriptPath}/${file.name}`)
        const codeStr = await fs.readFile(filePath, {encoding: 'utf-8'})
        const minifiedStr = (await minify(codeStr)).code
        const minifiedPath = path.join(`${path.resolve()}/public/min/${file.name}`)
        await fs.writeFile(minifiedPath, minifiedStr)
    }
}



// * modify html links
const htmlPath = path.join(`${path.resolve()}/public`)
const fileList = await fs.readdir(htmlPath, {withFileTypes: true})
for(const file of fileList){
    if(!file.isFile()){
        continue
    }
    const filePath = path.join(`${htmlPath}/${file.name}`)
    const htmlStr = await fs.readFile(filePath, {encoding: 'utf-8'})
    const minHtml = htmlStr.replace(/script\//g, 'min/')
    await fs.writeFile(filePath, minHtml)
}





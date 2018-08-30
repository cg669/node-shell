var path = require('path')
var fs = require('fs')
var swig = require('swig')
var MarkdownIt = require('markdown-it')
var rd = require('rd')
var net = require('net')
var md = new MarkdownIt({
    html:true,
    langPrefix: 'code-'
})
swig.setDefaults({cache:false})


//  去掉文件的扩展名
function stripExtname(name){
    var i = 0 - path.extname(name).length
    if(i === 0 ){
        i = name.length
    }
    return name.slice(0,i)
}

//  将markdown转换成html
function markdownToHTML(content){
    return md.render(content || '')
}

//  解析文章内容
function parseSourceContent(data){
    var splitStr = '---\n'
    var i = data.indexOf(splitStr)
    var info = {}
    if( i !== -1){
        var j = data.indexOf(splitStr, i + splitStr.length)
        if( j !== -1){
            var str = data.slice( i + splitStr.length , j).trim()
            data = data.slice( j + splitStr.length)
            str.split('\n').forEach( line=>{
                var i = line.indexOf(':')
                if(i !== -1){
                    var name = line.slice(0,i).trim()
                    var value = line.slice( i + 1).trim()
                    info[name] = value
                }
            })
        }
    }
    info.source = data
    return info
}

//  渲染模板
function renderFile(file,data){
    return swig.render(fs.readFileSync(file).toString(),{
        filename:file,
        autoescape:false,
        locals:data
    })
}

//  遍历所有文章
function eachSourceFile(sourceDir,cb){
    rd.eachFileFilterSync(sourceDir,/\.md$/,cb)
}

//  渲染文章
function renderPost(dir,file){
    var content = fs.readFileSync(file).toString()
    var post = parseSourceContent(content.toString())
    post.content = markdownToHTML(post.source)
    post.layout = post.layout || ''
    var config = loadConfig(dir)
    var layout = path.resolve(dir,'_layout',post.layout + '.html')
    var html = renderFile(layout,{post:post,config:config})
    return html
}

//  渲染文章列表
function renderPostList(dir){
    var list = []
    var sourceDir = path.resolve(dir,'_posts')
    eachSourceFile(sourceDir,function(f,s){
        var source = fs.readFileSync(f).toString()
        var post = parseSourceContent(source)
        post.timestamp = new Date(post.date)
        post.url = `/post/${stripExtname(f.slice(sourceDir.length+1))}.html`
        list.push(post)
    })
    list.sort(function(a,b){
        return b.timestamp - a.timestamp
    })
    var config = loadConfig(dir)
    var layout = path.resolve(dir,'_layout','index.html')
    var html = renderFile(layout,{posts:list,config:config})
    return html
}

//  读取配置信息
function loadConfig(dir){
    var content = fs.readFileSync(path.resolve(dir,'config.json').toString())
    var data = JSON.parse(content)
    return data
}

//  端口是否被占用
function portIsOccupied (port){
    const server= net.createServer().listen(port)
    return new Promise((resolve,reject)=>{
        server.on('listening',()=>{
            console.log(`the server is runnint on port ${port}`)
            server.close()
            resolve(port)
        })
        server.on('error',(err)=>{
            if(err.code==='EADDRINUSE'){
                resolve(portIsOccupied(port+1))//注意这句，如占用端口号+1
                console.log(`this port ${port} is occupied.try another.`)
            }else{
                reject(err)
            }
        })
    })

}

exports.renderPost = renderPost
exports.renderPostList = renderPostList
exports.stripExtname = stripExtname
exports.eachSourceFile = eachSourceFile
exports.loadConfig = loadConfig
exports.portIsOccupied = portIsOccupied

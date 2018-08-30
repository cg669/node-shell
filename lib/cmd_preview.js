


var express = require('express')
var serveStatic = require('serve-static')
var path = require('path')
var open = require('open')

//  工具库
var utils = require('./utils')
module.exports = function(dir){
    dir = dir || '.'
    //  初始化express
    var app = express()
    var router = express.Router()
    app.use('/assets',serveStatic(path.resolve(dir,'assets')))
    app.use(router)

    //  渲染文章
    router.get('/post/*',function(req,res,next){
        var name = utils.stripExtname(req.params[0])
        var file = path.resolve(dir,'_posts',name + '.md')
        var html = utils.renderPost(dir,file)
        res.writeHead(200,{'Content-Type':'text/html;charset=utf-8'});//设置response编码为utf-8
        res.end(html)
    })
    //  渲染列表
    router.get('/',function(req,res,next){
        var html = utils.renderPostList(dir)
        res.writeHead(200,{'Content-Type':'text/html;charset=utf-8'});//设置response编码为utf-8
        res.end(html)
    })

    var config = utils.loadConfig(dir)
    var staticPort = config.port || 3000
    utils.portIsOccupied(staticPort).then( port=>{
        var url = 'http://127.0.0.1:' + port
        app.listen(port)
        open(url)
    }) 
}

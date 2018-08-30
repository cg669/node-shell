var path = require('path')
var fse = require('fs-extra')

var utils = require('./utils')

module.exports = function(dir,options){
    dir = dir || '.'
    var outputDir = path.resolve(options.output || dir)

    //  写入文件
    function outputFile(file,content){
        console.log('生成页面：%s',file.slice(outputDir+1))
        fse.outputFileSync(file,content)
    }

    //  生成文章内容页面
    var sourceDir = path.resolve(dir,'_posts')
    utils.eachSourceFile(sourceDir,function(f,s){
        var html = utils.renderPost(dir,f)
        var releativeFile = utils.stripExtname(f.slice(sourceDir.length + 1)) + '.html'
        var file = path.resolve(outputDir,'posts',releativeFile)
        outputFile(file,html)
    })

    //  生成首页
    var html = utils.renderPostList(dir)
    var file = path.resolve(outputDir,'index.html')
    outputFile(file,html)

    //  将样式copy过去
    var sourceCssDir = path.resolve(dir,'assets','style.css')
    var fileCss = path.resolve(outputDir,'assets/style.css')
    fse.copySync(sourceCssDir,fileCss)
}
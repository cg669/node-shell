var path = require('path')
var fse = require('fs-extra')
var moment = require('moment')

var utils = require('./utils')

module.exports = function(dir){
    dir = dir || '.'

    //  创建基本目录
    fse.mkdirsSync(path.resolve(dir,'_layout'))
    fse.mkdirsSync(path.resolve(dir,'_posts'))
    fse.mkdirsSync(path.resolve(dir,'assets'))

    //  将模板复制过来
    var tplDir = path.resolve(__dirname,'../tpl')
    fse.copySync(tplDir,dir)

    //  创建第一篇文章
    newPost(dir,'hello world','这是我的第一次')
    console.log('创建成功')


    function newPost(dir,title,content){
        var data = [
            '---',
            'title:' + title,
            'date:' + moment().format('YYYY-MM-DD'),
            'layout:post',
            '---',
            '',
            content
        ].join('\n')

        var name = moment().format('YYYY-MM') + '/hello-world-demo.md'
        var file = path.resolve(dir,'_posts',name)
        fse.outputFileSync(file,data)
    }
}
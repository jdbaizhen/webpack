const entry = require('./entry.config.js');
//负责引入全局插件，如jquery
const webpack = require('webpack');
const path = require('path');
//js压缩插件
const uglify = require('uglifyjs-webpack-plugin');
//html插件
const htmlPlugin = require('html-webpack-plugin');
//提取css插件
const extractTextPlugin  = require('extract-text-webpack-plugin');
//同步检查html模板，所以我们需要引入node的glob对象使用。
const glob = require('glob');	
//清除冗余css插件
const PurifyCSSPlugin = require("purifycss-webpack");

let website = {
	publicPath : 'http://loaclhost:1717/'
}

module.exports = {
	entry : entry.path,
	output : {
		path : __dirname + "/dist",
		filename : '[name].js',
		//publicPath : website.publicPath
	},
	module : {
		rules : [
			{
				test : /\.css$/,
				use : extractTextPlugin.extract({
					fallback : 'style-loader',
					use : [
						{
							loader : 'css-loader',
							options : {
								modules : true,
								importLoaders: 1 
							}
						},
						//配置css3前缀
						{loader : 'postcss-loader'}
					]
				})
			},
			{
				test : /\.less$/,
				use : extractTextPlugin.extract({
					fallback : 'style-loader',
					use : [
						{loader : 'css-loader'},
						{loader : 'less-loader'}
					]
				})
			},
			{
				test : /\.scss$/,
				use : extractTextPlugin.extract({
					fallback : 'style-loader',
					use : [
						{loader : 'css-loader'},
						{loader : 'sass-loader'}
					]
				})
			},
			{
				test : /\.(png|jpg|gif)/,
				use : [{
					loader : 'url-loader',
					//把小于500000B的文件打成Base64的格式，写入JS
					options : {
						limit : 50000,
						outputPath : 'images/'
					}
				}]
			},
			{
				test : /\.(htm|html)$/,
				use : ['html-withimg-loader']
			},
			{
				test : /\.js$/,
				use : [{
					loader : 'babel-loader',
					options:{
			            presets:[
			                'es2015'
			            ]
			        }
				}],
				exclude:/node_modules/
			},
		]
	},
	plugins : [
		//new uglify(), 压缩js代码
		new htmlPlugin({
			//压缩html
			minify : {
				//去掉属性双引号
				removeAttributeQuotes : true
			},
			//避免js缓存
			hash : true,
			//要打包的html文件和路径
			template : './src/index.html'
		}),
       new extractTextPlugin('/css/index.css'),
       //这里配置了一个paths，主要是需找html模板，purifycss根据这个配置会遍历你的文件，查找哪些css被使用了,这个插件必须配合extract-text-webpack-plugin这个插件
       new PurifyCSSPlugin({
       	  paths: glob.sync(path.join(__dirname, 'src/*.html'))
       }),
       //配置插件
       new webpack.ProvidePlugin({
       		$ : 'jquery'
       })
	],
	devServer : {
		contentBase : __dirname + "/dist",
		host : 'localhost',
		compress : true,
		port : 1717
	},
	watchOptions:{
	    //检测修改的时间，以毫秒为单位
	    poll:1000, 
	    //防止重复保存而发生重复编译错误。这里设置的500是半秒内重复保存，不进行打包操作
	    aggregeateTimeout:500, 
	    //不监听的目录
	    ignored:/node_modules/, 
	}
}
